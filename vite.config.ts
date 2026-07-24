import vike from "vike/plugin";
import { vercel } from "vite-plugin-vercel/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
});
