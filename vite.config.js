import { defineConfig } from "vite";

export default defineConfig({
  root: "STEALTH_STEEL",
  base: "./",
  build: { outDir: "../dist", emptyOutDir: true },
  // BIS development exports contain TSX using the automatic React runtime.
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});

