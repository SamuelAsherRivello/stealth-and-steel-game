import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  // BIS development exports contain TSX using the automatic React runtime.
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});

