import test from "node:test";
import assert from "node:assert/strict";

import { bindToGameFrame } from "../../runtime/ui/game-frame-bounds.js";

test("a fixed overlay tracks the exact game-frame rectangle", () => {
  const listeners = new Map();
  const windowRef = {
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
  };
  const frameElement = {
    getBoundingClientRect: () => ({ left: 684, top: 3, width: 680, height: 1180 }),
  };
  const overlay = { style: {} };

  const dispose = bindToGameFrame({ overlay, frameElement, windowRef, ResizeObserverRef: null });

  assert.deepEqual(overlay.style, {
    left: "684px",
    top: "3px",
    width: "680px",
    height: "1180px",
  });
  dispose();
  assert.equal(listeners.size, 0);
});
