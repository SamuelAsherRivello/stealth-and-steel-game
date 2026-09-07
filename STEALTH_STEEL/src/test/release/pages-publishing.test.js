import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../../../${path}`, import.meta.url), "utf8");
const demoUrl = "https://samuelasherrivello.github.io/stealth-and-steel-game/";

test("README screenshot opens the image and demo links to the renamed live game", async () => {
  const readme = await read("README.md");
  assert.match(readme, /<a href="(STEALTH_STEEL\/documentation\/images\/stealth-and-steel-gameplay\.png)"><img src="\1" width="400" alt="[^"]+"\s*\/><\/a>/);
  assert.ok(readme.includes(`[${demoUrl}](${demoUrl})`));
  const image = await readFile(new URL("../../../documentation/images/stealth-and-steel-gameplay.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.deepEqual({ width: image.readUInt32BE(16), height: image.readUInt32BE(20) },
    { width: 576, height: 1024 }, "match the current portrait screenshot dimensions");
});

test("Pages assets remain relative so repository renames do not break the build", async () => {
  const { default: config } = await import("../../../../vite.config.js");
  assert.equal(config.base, "./");
});

test("Pages publishing checks deployment contracts before building", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.match(workflow, /push:\s+branches:\s+- main/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /run: npm run test:publish/);
  assert.match(workflow, /run: npm test/);
  assert.ok(workflow.indexOf("run: npm test") < workflow.indexOf("run: npm run build"));
  assert.ok(workflow.indexOf("run: npm run test:publish") < workflow.indexOf("run: npm run build"));
  assert.match(workflow, /path: dist/);
  assert.doesNotMatch(workflow, /babylon-light-stealth-grid/);
});
