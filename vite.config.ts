import vike from "vike/plugin";
import { vercel } from "vite-plugin-vercel/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [vike(), vercel(), react()],
  ssr: {
    external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
  optimizeDeps: {
    exclude: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
});
