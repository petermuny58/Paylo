import vike from "vike/plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [vike(), react()],
  // Keep Prisma + pg out of Vite's SSR module runner. Their WASM/dynamic
  // imports break after HMR restarts ("Vite module runner has been closed").
  ssr: {
    external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
  optimizeDeps: {
    exclude: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
});
