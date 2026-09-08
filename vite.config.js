import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { catalogFromFiles } from "./STEALTH_STEEL/src/runtime/gameplay/level-progress.js";

export default defineConfig({
  define: { __GAME_LEVELS__: JSON.stringify(catalogFromFiles(readdirSync(new URL('./STEALTH_STEEL/public/assets/levels/tiled/maps/', import.meta.url)))) },
  root: "STEALTH_STEEL",
  base: "./",
  build: { outDir: "../dist", emptyOutDir: true },
  // BIS development exports contain TSX using the automatic React runtime.
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});

