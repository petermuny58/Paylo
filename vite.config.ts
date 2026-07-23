Import vike from "vike/plugin";
import vikeVercel from "vike-vercel/plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [vike(), vikeVercel(), react()],
  ssr: {
    external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
  optimizeDeps: {
    exclude: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
});
