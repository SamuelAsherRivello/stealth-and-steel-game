import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMenu } from "../../runtime/ui/menu.js";

class Element extends EventTarget {
  _text = "";
  children = [];
  attributes = new Map();
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes.set(name, value); }
}

const documentRef = { createElement: () => new Element() };

test("C071 keeps the body and actions in one non-scrolling menu stack", () => {
  const menu = createMenu({
    titleText: "Developer",
    bodyText: "Shared body copy",
    buttons: [{ displayText: "Open GitHub" }],
    documentRef,
  });

  const contentStack = menu.panel.children[1];
  assert.ok(contentStack.className.split(" ").includes("menu-content-stack"));
  assert.deepEqual(contentStack.children, [menu.bodyArea, menu.actions]);
  assert.equal(menu.scrollContent, undefined);
});

test("C071 reserves one toast footprint and anchors logo and ribbon variants from it", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--menu-toast-bottom:\s*9dvh;/);
  assert.match(styles, /--menu-toast-offset:\s*15px;/);
  assert.match(styles, /--menu-first-visible-top:\s*calc\(var\(--menu-toast-bottom\) \+ var\(--menu-toast-offset\)\);/);
  assert.match(styles, /tiny-swords-menu-backdrop\.has-logo\s*\{[^}]*padding:\s*var\(--menu-first-visible-top\)/s);
  assert.match(styles, /tiny-swords-menu-backdrop:not\(\.has-logo\)\s*\{[^}]*padding:\s*calc\(var\(--menu-first-visible-top\) \+ var\(--menu-ribbon-overhang\)\)/s);
  assert.doesNotMatch(styles, /tiny-swords-menu-backdrop:not\(\.has-logo\) > \.tiny-swords-menu-composition\s*\{\s*margin:\s*auto;/s);
});

test("C071 uses one complete explicit prose style without outcome overrides", async () => {
  const [styles, outcomes] = await Promise.all([
    readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
    ),
    readFile(new URL("../../runtime/ui/level-complete-ui.js", import.meta.url), "utf8"),
  ]);
  const treasure = await readFile(
    new URL("../../runtime/ui/treasure-ui.js", import.meta.url),
    "utf8",
  );

  assert.match(styles, /\.ui-layer \.tiny-swords-body-text\s*\{/);
  assert.match(styles, /\.ui-layer \.tiny-swords-body-text\s*\{[^}]*font:\s*22px\/1\.6 Georgia, serif;[^}]*margin:\s*0;[^}]*color:\s*#513d2a;[^}]*text-align:\s*center;/s);
  assert.doesNotMatch(styles, /\.ui-layer \.menu-body p,/);
  assert.doesNotMatch(styles, /\.outcome-(?:loss|win) \.tiny-swords-body-text/);
  assert.match(treasure, /message\.className\s*=\s*['"]tiny-swords-body-text['"]/);
  assert.match(treasure, /countdown\.className\s*=\s*['"]tiny-swords-body-text['"]/);
  assert.match(outcomes, /bodyText:/);
});

test("C071 applies compact shared section, form, and action rhythm without changing Map sub-buttons", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--menu-action-gap:\s*3\.6px;/);
  assert.match(styles, /--menu-section-following-gap:\s*2\.4px;/);
  assert.match(styles, /--menu-form-item-gap:\s*3\.6px;/);
  assert.match(styles, /--menu-final-action-bottom:\s*8px;/);
  assert.match(styles, /\.ui-layer \.menu-actions\s*\{[^}]*gap:\s*var\(--menu-action-gap\);/s);
  assert.match(styles, /\.ui-layer \.menu-content-stack\s*\{[^}]*overflow:\s*clip;[^}]*padding-bottom:\s*var\(--menu-final-action-bottom\);/s);
  assert.match(styles, /\.ui-layer \.game-window \.settings-controls\s*\{[^}]*gap:\s*var\(--menu-form-item-gap\);/s);
  assert.match(styles, /\.ui-layer \.debug-visualizations-heading\s*\{[^}]*margin:\s*0 0 var\(--menu-section-following-gap\);/s);
  assert.match(styles, /\.ui-layer \.debug-visualizations-heading ~ \.toggle-control,\s*\.ui-layer \.map-order-heading \+ \.map-order-buttons\s*\{[^}]*margin-left:\s*20px;/s);
  assert.match(styles, /\.map-order-buttons\s*\{[^}]*gap:\s*8px;/s);
});

test("C071 title labels retain a doubled baseline and shrink to one line when the ribbon narrows", async () => {
  const [styles, menu, titleLabel] = await Promise.all([
    readFile(new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/menu.js", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/menu-title-label.js", import.meta.url), "utf8"),
  ]);

  assert.match(styles, /font:\s*bold clamp\(36px, 8cqw, 52px\)\/1\.1 Georgia, serif;/);
  assert.match(styles, /--menu-ribbon-title-safe-inset:\s*72px;/);
  assert.match(styles, /font:\s*bold clamp\(36px, 9\.6cqw, 56px\)\/1\.1 Georgia, serif;/);
  assert.match(styles, /\.ui-layer \.game-window \.tiny-swords-title-text\s*\{[^}]*display:\s*grid;[^}]*place-items:\s*center;/s);
  assert.match(styles, /tiny-swords-title-text[^}]*white-space:\s*nowrap;/s);
  assert.match(menu, /title\.menuTitleLabel\s*=\s*label/);
  assert.match(titleLabel, /--menu-ribbon-title-safe-inset/);
  assert.match(titleLabel, /title\.classList\.contains\("tiny-swords-ribbon"\)/);
  assert.match(titleLabel, /if \(width > available\) this\.style\.fontSize/);
});

test("C071 removes every menu scrollbar at the shared layout boundary", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(styles, /menu-scroll-content/);
  assert.match(styles, /\.ui-layer \.tiny-swords-menu-backdrop\s*\{[^}]*overflow:\s*clip;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-menu-backdrop\.has-logo\s*\{[^}]*overflow:\s*clip;/s);
});

test("C071 keeps the 44px close target with its supplied PNG", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /grid-template-columns:\s*44px minmax\(0, 1fr\) 44px;/);
  assert.match(styles, /\.ui-layer \.game-window \.game-window-close\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  assert.match(styles, /background:\s*url\('\/ui\/tiny-swords\/Icon_09\.png'\) center \/ 19\.2px 19\.2px no-repeat;/);
  assert.match(styles, /image-rendering:\s*pixelated;/);
});

test("C071 removes lightning only from BIS toast messaging", async () => {
  const [accountStyles, settings, outcomes] = await Promise.all([
    readFile(new URL("../../runtime/integration/bis-account.css", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/settings-ui.js", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/level-complete-ui.js", import.meta.url), "utf8"),
  ]);

  assert.match(accountStyles, /\.game-account-host \.bis-toast-lightning\s*\{\s*display:\s*none;\s*\}/);
  assert.match(settings, /displayText:\s*["']⚡ Account["']/);
  assert.match(outcomes, /icon:["']⚡["']/);
});
