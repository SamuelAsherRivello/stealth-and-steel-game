import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("shared menus end their paper panel at the compact body-and-action footprint", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--menu-content-min-height:\s*min\(325px, 25dvh\);/);
  assert.match(styles, /\.ui-layer \.tiny-swords-panel\s*\{[^}]*height:\s*auto;[^}]*flex:\s*0 0 auto;/s);
  assert.match(styles, /\.ui-layer \.menu-content-stack\s*\{[^}]*min-height:\s*var\(--menu-content-min-height\);[^}]*flex:\s*0 0 auto;[^}]*overflow:\s*clip;/s);
  assert.doesNotMatch(styles, /\.tiny-swords-menu-composition\s*\{[^}]*height:/s);
});
