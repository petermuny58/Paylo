import "dotenv/config";
import dns from "node:dns/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Bump when pool construction changes so HMR can't reuse a broken singleton.
const POOL_VERSION = 4;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgPoolVersion: number | undefined;
  // eslint-disable-next-line no-var
  var __prismaInit: Promise<PrismaClient> | undefined;
}

type DbTarget = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: pg.ClientConfig["ssl"];
};

function parseDatabaseUrl(connectionString: string): {
  hostname: string;
  target: Omit<DbTarget, "host">;
} {
  const parsed = new URL(connectionString.replace(/^postgresql:/i, "http:"));
  const isSupabase = /supabase/i.test(connectionString);
  return {
    hostname: parsed.hostname,
    target: {
      port: Number(parsed.port || 5432),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: decodeURIComponent(parsed.pathname.replace(/^\//, "") || "postgres"),
      ssl: isSupabase
        ? { rejectUnauthorized: false, servername: parsed.hostname }
        : undefined,
    },
  };
}

/**
 * Supabase pooler DNS returns multiple A records; some are unreachable from
 * this network. Build a pool against each IP and keep the first that can
 * actually run `select 1` (avoids a probe-then-reconnect gap that times out).
 */
async function createPool(connectionString: string): Promise<pg.Pool> {
  const { hostname, target } = parseDatabaseUrl(connectionString);
  let addresses: string[];
  try {
    const lookedUp = await dns.lookup(hostname, { all: true, family: 4 });
    addresses = lookedUp.map((a) => a.address);
  } catch {
    addresses = [hostname];
  }

  const errors: string[] = [];
  for (const host of addresses) {
    const pool = new pg.Pool({
      host,
      port: target.port,
      user: target.user,
      password: target.password,
      database: target.database,
      ssl: target.ssl,
      // Session-mode pooler (5432) is 1:1 with backends — keep this tiny.
      max: 1,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
    });
    try {
      await pool.query("select 1");
      return pool;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${host}: ${message}`);
      await pool.end().catch(() => {});
    }
  }

  throw new Error(
    `Could not reach Supabase Postgres via ${hostname}. ` +
      `Tried: ${errors.join(" | ")}. ` +
      `Check DATABASE_URL / network (port 5432 pooler IPs are flaky on some networks).`,
  );
}

async function createPrismaClient(): Promise<PrismaClient> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (global.__pgPool && global.__pgPoolVersion !== POOL_VERSION) {
    await global.__pgPool.end().catch(() => {});
    global.__pgPool = undefined;
    global.__prisma = undefined;
  }

  const pool = global.__pgPool ?? (await createPool(connectionString));
  if (process.env.NODE_ENV !== "production") {
    global.__pgPool = pool;
    global.__pgPoolVersion = POOL_VERSION;
  }

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Lazily init Prisma (probes pooler IPs on first use). */
export async function getPrisma(): Promise<PrismaClient> {
  if (global.__prisma && global.__pgPoolVersion === POOL_VERSION) {
    return global.__prisma;
  }
  if (!global.__prismaInit) {
    global.__prismaInit = createPrismaClient()
      .then((client) => {
        if (process.env.NODE_ENV !== "production") {
          global.__prisma = client;
        }
        return client;
      })
      .catch((err) => {
        global.__prismaInit = undefined;
        throw err;
      });
  }
  return global.__prismaInit;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    void global.__prisma?.$disconnect();
    global.__prisma = undefined;
    global.__prismaInit = undefined;
    void global.__pgPool?.end();
    global.__pgPool = undefined;
    global.__pgPoolVersion = undefined;
  });
}
