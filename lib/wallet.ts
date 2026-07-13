import { Direction } from "../generated/prisma/client.js";
import type { DashboardData } from "./types.js";
import { prisma } from "./prisma.js";
import { AppError } from "./money.js";

export type { DashboardData, DashboardPot, DashboardTransaction } from "./types.js";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [wallet, pots, transactions] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.pot.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    walletBalance: wallet?.balance ?? 0,
    pots: pots.map((p) => ({
      id: p.id,
      name: p.name,
      balance: p.balance,
      pct: p.allocationPct,
    })),
    recentActivity: transactions.map((tx) => ({
      id: tx.id,
      label: tx.label,
      amount: tx.direction === Direction.IN ? tx.amount : -tx.amount,
      dir: tx.direction === Direction.IN ? "in" : "out",
    })),
  };
}

/** MOCK — simulates MTN/Airtel mobile-money top-up until telecom licensing is in place. */
export async function mockTopUp(userId: string, amountNgwee: number): Promise<DashboardData> {
  if (amountNgwee <= 0) {
    throw new AppError("Amount must be greater than zero");
  }

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    await tx.wallet.update({
      where: { userId },
      data: { balance: { increment: amountNgwee } },
    });

    await tx.transaction.create({
      data: {
        userId,
        potId: null,
        label: "Mock mobile money top-up",
        amount: amountNgwee,
        direction: Direction.IN,
      },
    });
  });

  return getDashboardData(userId);
}

export async function sendToPot(userId: string, potId: string, amountNgwee: number): Promise<DashboardData> {
  if (amountNgwee <= 0) {
    throw new AppError("Amount must be greater than zero");
  }

  await prisma.$transaction(async (tx) => {
    const walletUpdate = await tx.wallet.updateMany({
      where: { userId, balance: { gte: amountNgwee } },
      data: { balance: { decrement: amountNgwee } },
    });
    if (walletUpdate.count !== 1) {
      throw new AppError("Insufficient wallet balance");
    }

    const potUpdate = await tx.pot.updateMany({
      where: { id: potId, userId },
      data: { balance: { increment: amountNgwee } },
    });
    if (potUpdate.count !== 1) {
      throw new AppError("Pot not found", 404);
    }

    const pot = await tx.pot.findUnique({ where: { id: potId }, select: { name: true } });

    await tx.transaction.create({
      data: {
        userId,
        potId,
        label: `Sent to ${pot?.name ?? "pot"}`,
        amount: amountNgwee,
        direction: Direction.OUT,
      },
    });
  });

  return getDashboardData(userId);
}

export async function withdrawFromWallet(
  userId: string,
  amountNgwee: number,
  pin: string,
): Promise<DashboardData> {
  if (amountNgwee <= 0) {
    throw new AppError("Amount must be greater than zero");
  }

  const { verifyUserPin } = await import("./auth.js");
  const pinOk = await verifyUserPin(userId, pin);
  if (!pinOk) {
    throw new AppError("Invalid transaction PIN", 401);
  }

  await prisma.$transaction(async (tx) => {
    const walletUpdate = await tx.wallet.updateMany({
      where: { userId, balance: { gte: amountNgwee } },
      data: { balance: { decrement: amountNgwee } },
    });
    if (walletUpdate.count !== 1) {
      throw new AppError("Insufficient wallet balance");
    }

    await tx.transaction.create({
      data: {
        userId,
        potId: null,
        label: "Wallet withdrawal",
        amount: amountNgwee,
        direction: Direction.OUT,
      },
    });
  });

  return getDashboardData(userId);
}

export async function spendFromPot(userId: string, potId: string, amountNgwee: number, label: string): Promise<DashboardData> {
  if (amountNgwee <= 0) {
    throw new AppError("Amount must be greater than zero");
  }

  await prisma.$transaction(async (tx) => {
    const potUpdate = await tx.pot.updateMany({
      where: { id: potId, userId, balance: { gte: amountNgwee } },
      data: { balance: { decrement: amountNgwee } },
    });
    if (potUpdate.count !== 1) {
      throw new AppError("Insufficient pot balance or pot not found");
    }

    await tx.transaction.create({
      data: {
        userId,
        potId,
        label: label.trim() || "Pot spend",
        amount: amountNgwee,
        direction: Direction.OUT,
      },
    });
  });

  return getDashboardData(userId);
}

export async function registerUser(input: {
  phoneNumber: string;
  password: string;
  pin: string;
}): Promise<{ id: string; phoneNumber: string }> {
  const { hashSecret } = await import("./auth.js");

  const existing = await prisma.user.findUnique({ where: { phoneNumber: input.phoneNumber } });
  if (existing) {
    throw new AppError("Phone number already registered", 409);
  }

  const [passwordHash, pinHash] = await Promise.all([
    hashSecret(input.password),
    hashSecret(input.pin),
  ]);

  const user = await prisma.user.create({
    data: {
      phoneNumber: input.phoneNumber,
      passwordHash,
      pinHash,
      wallet: { create: {} },
      pots: {
        create: [
          { name: "Restock", allocationPct: 60, balance: 0 },
          { name: "Take-Home", allocationPct: 25, balance: 0 },
          { name: "Savings", allocationPct: 15, balance: 0 },
          { name: "Tax Reserve", allocationPct: 0, balance: 0 },
        ],
      },
    },
    select: { id: true, phoneNumber: true },
  });

  return user;
}

export async function loginUser(phoneNumber: string, password: string): Promise<{ id: string; phoneNumber: string }> {
  const { verifySecret } = await import("./auth.js");

  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    throw new AppError("Invalid phone number or password", 401);
  }

  const valid = await verifySecret(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid phone number or password", 401);
  }

  return { id: user.id, phoneNumber: user.phoneNumber };
}
