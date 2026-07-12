# Scan-to-Pay — Backend (Part 1 + Part 2, hosted on Supabase)

## Project layout

```
server/
  config/prisma.ts          # Prisma client singleton
  utils/AppError.ts         # Operational error type
  middleware/
    auth.middleware.ts      # JWT verification
    error.middleware.ts     # Global error handler
  controllers/
    transfer.controller.ts  # POST /wallet/transfer
prisma/
  schema.prisma             # Database schema
```

## Endpoints

| Route | Auth? | Status |
|---|---|---|
| `POST /auth/register` | – | Real |
| `POST /auth/login` | – | Real |
| `GET /wallet/me` | Y | Real |
| `POST /wallet/top-up`, `/wallet/withdraw` | Y | Real (telecom call mocked) |
| `POST /qr/generate` | Y | Real |
| `GET /qr/status/:referenceCode` | Y | Real |
| `POST /wallet/transfer` | Y | Real |

Nothing left to mock except the two `mockTelecom*` functions in `wallet.controller.ts` — everything else,
including the database, is real once you finish setup below.

## Setup — connecting to Supabase

1. In your Supabase project dashboard: **Connect** (top of the page) → **ORM** tab → **Prisma**.
   Supabase shows you both URLs you need.
2. Copy `env.example` to `.env` and fill in:
   - `DATABASE_URL` — the **pooled** connection string (port 6543, ends in `?pgbouncer=true`). This is
     what the running app uses for every query.
   - `DIRECT_URL` — the **direct** connection string (port 5432, `db.[project-ref].supabase.co`). This
     is what the Prisma CLI uses for migrations *only*. Mixing these two up is the single most common
     Prisma+Supabase failure — the pooled connection's transaction mode can't support the prepared
     statements `prisma migrate` needs, so migrations fail silently or with a confusing error.
   - `JWT_SECRET` — any long random string.
3. `npm install`
4. `npx prisma migrate dev --name init` — creates every table for real, in your Supabase project. You
   can watch the tables appear in Supabase's **Table Editor** as this runs.
5. `npm run seed` — creates the demo buyer/seller accounts, prints a ready-to-paste login `curl`
   command.
6. `npm run dev` — starts the server on `PORT` from `.env` (default 4000).
7. `curl http://localhost:4000/health` should return `{"status":"ok"}`. Check Supabase's **Table
   Editor** — the `users`, `wallets`, and `transactions` tables should already have your seeded rows.

## Testing the whole chain from the command line

```bash
# 1. Log in as the seeded seller
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+260970000002","password":"demo-password"}'
# -> copy the returned token

# 2. As the seller, generate a QR for K25.00 (2500 ngwee)
curl -X POST http://localhost:4000/qr/generate \
  -H "Authorization: Bearer <seller token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":2500}'
# -> copy the returned intentId

# 3. Log in as the seeded buyer, then pay
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+260970000001","password":"demo-password"}'

curl -X POST http://localhost:4000/wallet/transfer \
  -H "Authorization: Bearer <buyer token>" \
  -H "Content-Type: application/json" \
  -d '{"referenceCode":"<intentId>","pin":"1234"}'
```

Refresh Supabase's Table Editor after step 3 — the buyer and seller wallet balances should have moved
for real, and the transaction row should show `status: SUCCESS`.

## Notes

- Money is stored as integer ngwee (1 ZMW = 100 ngwee) everywhere — never floats. Every amount field in
  every request/response body is ngwee too.
- `POST /wallet/transfer` never reads `amount` from the client at all — see the comments in
  `server/controllers/transfer.controller.ts` for why.
- The double-spend / negative-balance guard is a single conditional `UPDATE ... WHERE balance >= amount`
  statement, reused in `transfer.controller.ts` and `wallet.controller.ts`'s withdraw handler.
