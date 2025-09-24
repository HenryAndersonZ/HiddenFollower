import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  resolve: {
    fallback: {
      buffer: "buffer",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      path: "path-browserify",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
