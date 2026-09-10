import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const app = join(root, "STEALTH_STEEL");
const assets = join(app, "public/assets");
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

test("root commands target the contained application and preserve Pages output", async () => {
  const { default: config } = await import("../../../../vite.config.js");
  assert.equal(resolve(root, config.root), app);
  assert.equal(resolve(app, config.build.outDir), join(root, "dist"));
  assert.equal(config.base, "./");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  assert.equal(pkg.scripts.test, "node STEALTH_STEEL/src/test/run-tests.mjs");
  for (const [name, dependency] of Object.entries(pkg.dependencies)) {
    assert.equal(lock.packages[""].dependencies[name], dependency);
    if (dependency.startsWith("file:")) assert.ok(existsSync(join(root, dependency.slice(5))), dependency);
  }
  for (const legacy of ["src", "test", "scripts", "public", "plugins", "vendor", "documentation", "openspec", "index.html"]) {
    assert.equal(existsSync(join(root, legacy)), false, `Legacy root path: ${legacy}`);
  }
  assert.ok(existsSync(join(root, ".openspec/config.yaml")));
});

test("the repository OpenSpec adapter supports the pinned latest CLI in .openspec", () => {
  const result = spawnSync(process.execPath, [join(root, ".openspec/cli.mjs"), "context", "--json"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, OPENSPEC_TELEMETRY: "0" },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const context = JSON.parse(result.stdout);
  assert.equal(context.root.path, resolve(root));
  assert.equal(context.root.source, "nearest");
  assert.equal(context.root.role, "openspec_root");
});

test("the expanded OpenSpec skills route commands through the .openspec adapter", () => {
  const generatedSkills = [
    "apply-change", "archive-change", "bulk-archive-change", "continue-change",
    "explore", "ff-change", "new-change", "onboard", "propose", "sync-specs",
    "update-change", "verify-change",
  ];
  for (const name of generatedSkills) {
    const contents = readFileSync(join(root, `.agents/skills/openspec-${name}/SKILL.md`), "utf8");
    assert.match(contents, /generatedBy: "1\.13\.0"/, name);
    assert.match(contents, /npm run openspec -- /, name);
    assert.doesNotMatch(contents, /(?:`|^\s+)openspec (?:archive|config|context|doctor|feedback|instructions|list|new|schemas|show|status|store|update|validate|view)\b/m, name);
  }
});

test("every active Tiled image and external tileset resolves inside the public asset tree", () => {
  let references = 0;
  const visit = (value, file) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (["image", "source"].includes(key) && typeof child === "string") {
        const target = resolve(dirname(file), child);
        assert.ok(target.startsWith(assets + "/") || target.startsWith(assets + "\\"), target);
        assert.ok(existsSync(target), `${file}: ${child}`);
        if (key === "image") assert.ok(target.startsWith(join(assets, "images")), target);
        references++;
      } else visit(child, file);
    }
  };
  for (const file of walk(join(assets, "levels"))) {
    // Historical editor backups can reference retired palettes; preserve them.
    if (/\.(tmj|tsj)$/.test(file) && !file.endsWith(".bak.tmj")) visit(JSON.parse(readFileSync(file, "utf8")), file);
  }
  assert.ok(references > 20, "Check the maps and the entire tileset palette");
});

test("image sources sit beside their exports and public images use the game or themed UI folders", () => {
  assert.deepEqual(readdirSync(assets).sort(), ["audio", "images", "levels"]);
  for (const file of walk(join(app, "public"))) {
    if (/\.(png|svg|aseprite|jpe?g|webp)$/i.test(file)) {
      const inGameImages = file.startsWith(join(assets, "images") + "/") || file.startsWith(join(assets, "images") + "\\");
      const inThemedUi = dirname(file) === join(app, "public/ui/tiny-swords") && file.endsWith(".png");
      assert.ok(inGameImages || inThemedUi, file);
    }
    if (file.endsWith(".aseprite")) {
      const bytes = readFileSync(file);
      assert.equal(bytes.readUInt16LE(4), 0xa5e0);
      assert.equal(bytes.readUInt32LE(0), bytes.length);
      assert.ok(readdirSync(dirname(file)).some(name => name.endsWith(".png")), file);
    }
  }
  assert.ok(existsSync(join(assets, "images/enemies/archer/Arrow.png")));
  assert.ok(existsSync(join(app, "public/environment.json")));
  const ignore = readFileSync(join(root, ".gitignore"), "utf8");
  assert.ok(ignore.includes("STEALTH_STEEL/public/assets/images/enemies/goblin/Torch_Red.aseprite"));
});
