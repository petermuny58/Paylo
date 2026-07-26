import vike from "vike/plugin";
import { vercel } from "vite-plugin-vercel/vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Vite does not put non-VITE_ .env keys onto process.env by default.
  // Server code (JWT, DB) needs them at runtime during SSR / API routes.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    plugins: [
      vike(),
      vercel({
        // Give cold-start + first DB connect enough headroom on Hobby/Pro.
        defaultMaxDuration: 30,
      }),
      react(),
    ],
    ssr: {
      external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
    },
    optimizeDeps: {
      exclude: ["@prisma/client", "@prisma/adapter-pg", "pg"],
    },
  };
});
