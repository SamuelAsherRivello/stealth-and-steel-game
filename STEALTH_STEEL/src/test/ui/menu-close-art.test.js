import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the Tiny Swords close control renders a clean CSS X instead of the mismatched sprite", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(
    styles,
    /\.ui-layer \.game-window \.game-window-close\s*\{[^}]*background-color:\s*transparent;/s,
  );
  assert.doesNotMatch(styles, /\.game-window-close\s*\{[^}]*Icon_09\.png/s);
  assert.match(
    styles,
    /\.ui-layer \.game-window \.game-window-close::before,\s*\.ui-layer \.game-window \.game-window-close::after\s*\{[^}]*display:\s*block;/s,
  );
});
