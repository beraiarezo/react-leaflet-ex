import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 1234,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [react()],
});
