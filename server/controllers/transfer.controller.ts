import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma, TransactionStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

// We deliberately do NOT accept `amount` here, even though the scanned QR
// JSON the client has on-device will contain one. The server is the single
// source of truth for the amount — see the referenceCode lookup below for
// why that matters.
const transferSchema = z.object({
  referenceCode: z.string().min(1, 'Missing QR reference code'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits'),
});

// POST /wallet/transfer
// Buyer has scanned a seller's QR and is authorizing the payment with their PIN.
export const transferFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { referenceCode, pin } = transferSchema.parse(req.body);
    const buyerId = req.user!.id; // set by requireAuth after verifying the JWT

    // ── 1. Load the PENDING intent created by POST /qr/generate (Part 2) ──
    //
    // Whatever `amount` was sitting in the QR payload the client scanned is
    // IGNORED from this point on. We only trust the amount attached to this
    // referenceCode in our own database. A buyer's device could decode the
    // QR, change 5000 ngwee to 5, and re-encode it before calling this
    // endpoint — it wouldn't matter, because this handler never reads an
    // amount off the request body at all.
    const intent = await prisma.transaction.findUnique({ where: { referenceCode } });

    if (!intent) {
      throw new AppError('Invalid or unrecognized payment code', 404);
    }
    if (intent.status !== TransactionStatus.PENDING) {
      throw new AppError('This payment code has already been used or cancelled', 409);
    }
    if (intent.expiresAt && intent.expiresAt < new Date()) {
      // Close it out so it can't be retried, then bail.
      await prisma.transaction.update({
        where: { id: intent.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw new AppError('This QR code has expired — ask the seller to generate a new one', 410);
    }
    if (!intent.receiverId) {
      throw new AppError('Malformed payment intent (no seller attached)', 500);
    }
    if (intent.receiverId === buyerId) {
      throw new AppError('You cannot pay yourself', 400);
    }

    const amount = intent.amount; // authoritative — from OUR row, never the client

    // ── 2. Verify the buyer's PIN before touching any balances ────────────
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new AppError('Buyer account not found', 404);

    const pinIsValid = await bcrypt.compare(pin, buyer.pinHash);
    if (!pinIsValid) throw new AppError('Incorrect PIN', 401);

    // ── 3. Move the money. Everything below is one atomic unit — if any
    // line throws, Prisma rolls the whole thing back: no partial debits, no
    // money created or destroyed, and the intent stays exactly as it was so
    // the buyer can safely retry.
    const completed = await prisma.$transaction(
      async (tx) => {
        // 3a. Debit the buyer.
        //
        // This single UPDATE ... WHERE balance >= amount statement is BOTH
        // the negative-balance guard AND the double-spend guard. Postgres
        // executes the WHERE-check and the write as one atomic operation
        // per row, so if two /wallet/transfer requests for the same buyer
        // land at the same instant, Postgres simply serializes them: the
        // first UPDATE commits and lowers the balance, then the second
        // UPDATE re-evaluates its WHERE clause against the NEW balance and,
        // if there's no longer enough, touches zero rows instead of ever
        // going negative. No SELECT ... FOR UPDATE or app-level mutex
        // needed — the guard lives inside a single SQL statement.
        const debit = await tx.wallet.updateMany({
          where: {
            userId: buyerId,
            balance: { gte: amount },
          },
          data: {
            balance: { decrement: amount },
          },
        });

        if (debit.count === 0) {
          // Either genuinely insufficient funds, or this request lost a
          // race against another simultaneous transfer. Same response
          // either way — throwing here rolls back everything above.
          throw new AppError('Insufficient balance', 402);
        }

        // 3b. Credit the seller. Safe to do unconditionally now — the
        // debit above already proved the money exists and is reserved.
        await tx.wallet.update({
          where: { userId: intent.receiverId! },
          data: { balance: { increment: amount } },
        });

        // 3c. Close out the ledger row: PENDING -> SUCCESS, attach buyer.
        return tx.transaction.update({
          where: { id: intent.id },
          data: {
            status: TransactionStatus.SUCCESS,
            senderId: buyerId,
          },
        });
      },
      {
        // Read Committed (Postgres's default) is sufficient here — the
        // concurrency guard is baked into the UPDATE's WHERE clause above,
        // not a separate SELECT-then-UPDATE, so there's no race window for
        // a stricter isolation level to close. Set explicitly so the
        // choice is documented rather than accidental.
        isolation: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res.status(200).json({
      message: 'Payment successful',
      transaction: {
        id: completed.id,
        amount: completed.amount,
        status: completed.status,
        referenceCode: completed.referenceCode,
      },
    });
  } catch (err) {
    next(err);
  }
};
