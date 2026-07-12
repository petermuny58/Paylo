import { PrismaClient } from '@prisma/client';

// Standard singleton pattern. Prevents spinning up a new PrismaClient (and
// therefore a new DB connection pool) on every hot-reload during
// development, which otherwise exhausts Postgres's connection limit fast.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
