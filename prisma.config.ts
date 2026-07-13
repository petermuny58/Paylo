import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: the CLI uses this file for migrations. Use DIRECT_URL (port 5432,
// unpooled) so migrate/dev can run prepared statements. The running app uses
// DATABASE_URL (pooled, port 6543) via lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
