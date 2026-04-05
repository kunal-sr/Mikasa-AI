import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { builtinModules } from "node:module";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@renderer": path.resolve(__dirname, "src/renderer"),
      "@shared": path.resolve(__dirname, "src/shared")
    }
  },
  build: {
    outDir: "dist"
  },
  server: {
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    exclude: ["electron", ...builtinModules]
  }
});
