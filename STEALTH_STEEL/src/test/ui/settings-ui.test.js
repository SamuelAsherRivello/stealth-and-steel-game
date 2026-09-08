import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { DEBUG_SETTING_KEYS, createSettingsStore } from "../../runtime/runtime-settings/runtime-settings-store.js";
import { GameWindow } from "../../runtime/ui/game-window.js";
import {
  createDebugControl,
  createSettingsUi,
} from "../../runtime/ui/settings-ui.js";

class FakeClassList {
  values = new Set();
  add(value) { this.values.add(value); }
}

class FakeElement extends EventTarget {
  _text = "";
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  children = [];
  attributes = new Map();
  classList = new FakeClassList();
  parentNode = null;
  isConnected = false;
  focused = false;
  append(...children) {
    for (const child of children) {
      child.parentNode = this;
      child.isConnected = this.isConnected;
      this.children.push(child);
    }
  }
  prepend(...children) { this.append(...children); this.children = [...children, ...this.children.filter(child => !children.includes(child))]; }
  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    }
    this.parentNode = null;
    this.isConnected = false;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  focus() { this.focused = true; }
}

function createDocument() {
  return { createElement: () => new FakeElement() };
}

function click(target, eventTarget = target) {
  const event = new Event("click");
  Object.defineProperty(event, "target", { value: eventTarget });
  target.dispatchEvent(event);
}

function elementByClass(root, className) {
  const pending = [root];
  while (pending.length) {
    const element = pending.shift();
    if ((element.className ?? "").split(/\s+/).includes(className)) return element;
    pending.push(...element.children);
  }
  assert.fail(`Missing .${className}`);
}

test("Developer lists five independent visualizations and clears all their settings", () => {
  const store = createSettingsStore(null);
  const ui = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(), store,
    pauseController: { pause() {}, resume() {} } });
  ui.open();
  click(elementByClass(ui.activeWindow.panel, "developer-settings-button"));
  const content = elementByClass(ui.developerWindow.panel, "developer-settings-controls");
  assert.equal(content.children[0].textContent, "Debug Draw");
  const rows = content.children.slice(1, 6);
  assert.deepEqual(rows.map(row => row.children[0].textContent), [
    "Coordinates", "Enemy Perceptions", "Enemy Tasks", "Physics Colliders", "Tile Map Info",
  ]);
  const keys = [DEBUG_SETTING_KEYS.showCoordinates, DEBUG_SETTING_KEYS.showEnemyPerceptions,
    DEBUG_SETTING_KEYS.showEnemyAiLabels, DEBUG_SETTING_KEYS.showColliders, DEBUG_SETTING_KEYS.showTileMapInfo];
  rows.forEach((row, index) => {
    row.children[1].checked = true;
    row.children[1].dispatchEvent(new Event("change"));
    keys.forEach((key, i) => assert.equal(store.get(key), i <= index));
  });
  click(content.children.at(-1));
  keys.forEach(key => assert.equal(store.get(key), false));
  rows.forEach(row => assert.equal(row.children[1].checked, false));
});

test("Space does not activate the settings gear", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const store = { get: () => 100 };
  const pauseController = { pause() {}, resume() {} };
  const settingsUi = createSettingsUi({
    host,
    pauseController,
    store,
    documentRef,
  });
  const event = new Event("keydown", { cancelable: true });
  Object.defineProperty(event, "code", { value: "Space" });

  settingsUi.gear.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(settingsUi.activeWindow, null);
});

test("visualization controls use exact labels and write independent keys", () => {
  const documentRef = createDocument();
  const values = new Map([
    [DEBUG_SETTING_KEYS.showCoordinates, true],
    [DEBUG_SETTING_KEYS.showEnemyPerceptions, false],
  ]);
  const writes = [];
  const store = {
    get: (key) => values.get(key),
    set(key, value) {
      writes.push([key, value]);
      values.set(key, value);
    },
  };
  const particles = createDebugControl(
    documentRef,
    store,
    "Coordinates",
    DEBUG_SETTING_KEYS.showCoordinates,
  );
  const animatedTile = createDebugControl(
    documentRef,
    store,
    "Enemy Perceptions",
    DEBUG_SETTING_KEYS.showEnemyPerceptions,
  );

  assert.equal(particles.row.children[0].textContent, "Coordinates");
  assert.equal(animatedTile.row.children[0].textContent, "Enemy Perceptions");
  assert.equal(particles.checkbox.checked, true);
  assert.equal(animatedTile.checkbox.checked, false);
  particles.checkbox.checked = false;
  particles.checkbox.dispatchEvent(new Event("change"));
  animatedTile.checkbox.checked = true;
  animatedTile.checkbox.dispatchEvent(new Event("change"));
  assert.deepEqual(writes, [
    [DEBUG_SETTING_KEYS.showCoordinates, false],
    [DEBUG_SETTING_KEYS.showEnemyPerceptions, true],
  ]);


});

test("game window closes only when the backdrop itself is clicked", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const opener = new FakeElement();
  const content = new FakeElement();
  let closed = 0;
  const gameWindow = new GameWindow({
    host, title: "Settings Menu", content, documentRef, opener,
    onClose: () => { closed += 1; },
  });

  assert.equal(gameWindow.panel.attributes.get("role"), "dialog");
  assert.equal(gameWindow.panel.attributes.get("aria-modal"), "true");
  assert.match(gameWindow.panel.attributes.get("aria-labelledby"), /^game-window-title-/);
  assert.equal(gameWindow.closeButton.focused, true);

  click(gameWindow.backdrop, gameWindow.panel);
  assert.equal(closed, 0);
  assert.equal(gameWindow.backdrop.isConnected, true);
  click(gameWindow.backdrop, gameWindow.backdrop);
  assert.equal(closed, 1);
  assert.equal(opener.focused, true);
  gameWindow.close();
  assert.equal(closed, 1);
});

test("X closes the window once and returns focus", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const opener = new FakeElement();
  const gameWindow = new GameWindow({
    host, title: "Settings Menu", content: new FakeElement(), documentRef, opener,
  });
  click(gameWindow.closeButton);
  assert.equal(gameWindow.backdrop.isConnected, false);
  assert.equal(opener.focused, true);
});

test("settings source composes required controls, persistence, and pause lifecycle", async () => {
  const [source, main] = await Promise.all([
    readFile(new URL("../../runtime/ui/settings-ui.js", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/main.js", import.meta.url), "utf8"),
  ]);
  assert.match(source, /gear\.setAttribute\("aria-label", "Open settings"\)/);
  assert.match(source, /icon\.src = `\$\{ASSET_BASE\}ui\/tiny-swords\/Icon_10\.png`/);
  assert.match(source, /title:\s*"Settings Menu"/);
  assert.match(source, /createMenuButton\(\{ displayText: "Developer"/);
  assert.match(source, /title: "Developer"/);
  assert.match(source, /"Music", RUNTIME_AUDIO_SETTING_KEYS\.music/);
  assert.match(source, /"SFX", RUNTIME_AUDIO_SETTING_KEYS\.sfx/);
  assert.match(source, /"Physics Colliders"/);
  assert.match(source, /"Coordinates"/);
  assert.match(source, /"Enemy Perceptions"/);
  assert.match(source, /createToggleControl\(\{ labelText: "FullScreen"/);
  assert.match(source, /checkbox\.checked = Boolean\(documentRef\.fullscreenElement\)/);
  assert.match(source, /applyFullscreen\(checked, documentRef\)/);
  assert.doesNotMatch(source, /DISPLAY_SETTING_KEYS/);
  assert.match(source, /createSliderControl\(\{ labelText, value: store\.get\(key\)/);
  assert.match(source, /createMenuButton\(\{ displayText: "Clear All Settings"/);
  assert.match(source, /createMenuButton\(\{ displayText: "Open GitHub"/);
  assert.match(source, /PROJECT_GITHUB_URL = "https:\/\/github\.com\/SamuelAsherRivello\/stealth-and-steel-game"/);
  assert.match(source, /openExternal\(PROJECT_GITHUB_URL, "_blank", "noopener,noreferrer"\)/);
  assert.match(source, /store\.reset\(\)/);
  assert.match(source, /pauseController\.pause\('settings'\)/);
  assert.match(source, /pauseController\.resume\('settings'\)/);
  assert.doesNotMatch(source, /Skip Start Menu/);
  assert.match(main, /createSettingsUi\(\{ host: gameUi, modalHost: domBody, screenLayer: domScreen, pauseController, openAccount: \(\) => accountHost.open\(\) \}\)/);
  assert.match(main, /updateSpriteAnimationManager\(animationManager, activeDelta \* 1000\)/);
  assert.match(main, /playerRecord\.actor\.update\(activeDelta, dynamicColliders\)/);
  assert.match(main, /showColliders = runtimeSettingsStore\.get\(RUNTIME_DEBUG_SETTING_KEYS\.showColliders\)/);
  assert.match(main, /marker\.setVisible\(value\)/);
  const diagnostics = main.slice(main.indexOf("const diagnosticCharacters = ["), main.indexOf('window.addEventListener("beforeunload"'));
  for (const required of ["SpawnerType.SHEEP", "SpawnerType.ENEMY", "getCombatCollider()", "getMovementCollider()", "drawDiagnostics(", "projectiles.getColliders()", "showColliders"]) {
    assert.ok(diagnostics.includes(required), `missing ${required}`);
  }
  assert.match(main, /function drawGridLines\([^)]*\)[\s\S]*rgb\(80 86 92 \/ 48%\)[\s\S]*lineWidth = 1/);
  assert.match(main, /if \(tileMapInfo\) drawGridLines\(offset\)/);
  assert.doesNotMatch(main, /DISPLAY_SETTING_KEYS|applyFullscreenPreference/);
});

test("developer settings opens above the main settings window and closes back to it", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const values = new Map();
  const store = {
    get: (key) => values.get(key) ?? (key.includes("show") ? false : 100),
    set: (key, value) => values.set(key, value),
    reset: () => values.clear(),
  };
  const pauseCalls = [];
  const settingsUi = createSettingsUi({
    host,
    pauseController: { pause: () => pauseCalls.push("pause"), resume: () => pauseCalls.push("resume") },
    store,
    documentRef,
  });

  settingsUi.open();
  const developerButton = elementByClass(settingsUi.activeWindow.panel, "developer-settings-button");
  assert.equal(developerButton.textContent, "Developer");
  click(developerButton);
  assert.equal(settingsUi.developerWindow.panel.children[0].textContent, "Developer");
  assert.equal(settingsUi.developerWindow.backdrop.classList.values.has("developer-settings-backdrop"), true);
  assert.equal(pauseCalls.join(","), "pause");

  click(settingsUi.developerWindow.closeButton);
  assert.equal(settingsUi.developerWindow, null);
  assert.equal(settingsUi.activeWindow.backdrop.isConnected, true);
  assert.equal(pauseCalls.join(","), "pause");
  click(settingsUi.activeWindow.closeButton);
  assert.equal(pauseCalls.join(","), "pause,resume");
});

test("developer settings opens the related GitHub project above Reset", () => {
  const documentRef = createDocument();
  const opened = [];
  const settingsUi = createSettingsUi({
    host: new FakeElement(),
    documentRef,
    store: { get: () => 100, reset() {} },
    pauseController: { pause() {}, resume() {} },
    openExternal: (...args) => opened.push(args),
  });

  settingsUi.open();
  click(elementByClass(settingsUi.activeWindow.panel, "developer-settings-button"));
  const developerContent = elementByClass(settingsUi.developerWindow.panel, "developer-settings-controls");
  const githubButton = developerContent.children.at(-2);
  const resetButton = developerContent.children.at(-1);

  assert.equal(githubButton.textContent, "Open GitHub");
  assert.equal(resetButton.textContent, "Clear All Settings");
  click(githubButton);
  assert.deepEqual(opened, [[
    "https://github.com/SamuelAsherRivello/stealth-and-steel-game",
    "_blank",
    "noopener,noreferrer",
  ]]);
});

test("settings chrome follows inspiration frame-relative measurements", async () => {
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  for (const selector of [
    ".settings-gear", ".game-window-backdrop",
    ".game-window-title", ".game-window-close", ".settings-controls",
    ".volume-control", ".volume-scale", ".settings-reset", ".collider-control",
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const declarations = styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
    assert.ok(declarations, `missing ${selector}`);
    // The close button uses a deliberate three-pixel inset inside the panel.
    const scalableDeclarations = selector === ".game-window-close"
      ? declarations.replace(/(?:top|right):\s*3px;/g, "")
      : declarations;
    assert.doesNotMatch(scalableDeclarations, /(?:\d|\.)(?:px|vw|vh)\b/);
  }
  assert.match(styles, /--screen-margin:\s*20px/);
  assert.match(styles, /\.settings-gear\s*\{[^}]*top:\s*var\(--ui-safe-top\);[^}]*right:\s*var\(--ui-safe-right\);[^}]*width:\s*clamp\(1\.375rem, 4cqw, 2rem\);[^}]*height:\s*clamp\(1\.375rem, 4cqw, 2rem\);[^}]*padding:\s*0\.35cqw;[^}]*border:\s*0\.175cqw solid/s);
  assert.match(styles, /\.game-window-backdrop\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;[^}]*background:\s*rgb\(0 0 0 \/ 42%\)/s);
  assert.match(styles, /\.game-window-dimmer\s*\{[^}]*inset:\s*0;[^}]*rgb\(0 0 0 \/ 20%\)/s);
  assert.match(styles, /\.developer-settings-dimmer\s*\{[^}]*background:\s*rgb\(0 0 0 \/ 20%\)/s);
  assert.match(styles, /\.menu-panel\s*\{[^}]*box-shadow:\s*5px 5px 5px rgb\(0 0 0 \/ 32\.5%\);[^}]*max-height:\s*100%;[^}]*overflow:\s*auto;/s);
});

test("gear icon is transparent vector artwork", async () => {
  const icon = await readFile(new URL("../../../public/assets/images/ui/gear.svg", import.meta.url), "utf8");
  assert.match(icon, /viewBox="0 0 64 64"/);
  assert.doesNotMatch(icon, /<rect[^>]+(?:fill|style)=/);
});


test("Account is styled and placed immediately before Developer", () => {
  const settings = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(),
    store: {get: () => 100}, pauseController: {pause() {}, resume() {}}, openAccount() {} });
  settings.open();
  const content = elementByClass(settings.activeWindow.panel, "settings-controls");
  assert.equal(content.children[3].textContent, '⚡ Account');
  assert.equal(content.children[4].textContent, 'Developer');
  assert.ok(content.children[3].className.split(' ').includes('settings-account-button'));
  assert.ok(content.children[3].className.split(' ').includes('tiny-swords-button'));
  assert.ok(content.children[0].className.split(' ').includes('slider-control'));
  settings.close();
});


test("Enemy Tasks control writes independently and Clear All Settings clears the checkbox", () => {
  const documentRef = createDocument(), values = new Map();
  const store = { get: key => values.get(key) ?? false, set: (key,value) => values.set(key,value), reset: () => values.clear() };
  const ui = createSettingsUi({ host: new FakeElement(), documentRef, store, pauseController: { pause() {}, resume() {} } });
  ui.open();
  click(elementByClass(ui.activeWindow.panel, "developer-settings-button"));
  const content = elementByClass(ui.developerWindow.panel, "developer-settings-controls");
  const row = content.children.find(child => child.children[0]?.textContent === 'Enemy Tasks');
  const checkbox = row.children[1];
  assert.equal(checkbox.checked, false);
  checkbox.checked = true; checkbox.dispatchEvent(new Event('change'));
  assert.equal(store.get(DEBUG_SETTING_KEYS.showEnemyAiLabels), true);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  click(content.children.at(-1));
  assert.equal(checkbox.checked, false);
});
