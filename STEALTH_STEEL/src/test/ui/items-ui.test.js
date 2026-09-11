import test from "node:test";
import assert from "node:assert/strict";
import { createItemsUi } from "../../runtime/ui/items-ui.js";

class Element extends EventTarget {
  _text = "";
  children = [];
  attributes = new Map();
  parentNode = null;
  isConnected = false;
  className = "";
  hidden = false;
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  append(...children) { for (const child of children) { child.parentNode = this; child.isConnected = this.isConnected; this.children.push(child); } }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  focus() {}
  remove() { this.parentNode?.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
}

const find = (root, predicate) => {
  const pending = [root];
  while (pending.length) {
    const current = pending.shift();
    if (predicate(current)) return current;
    pending.push(...current.children);
  }
  assert.fail("Expected matching element");
};

const item = (assetId, family, name, effect) => ({ assetId, family, name, effect, iconUrl: `https://chain.example/${assetId}.png` });

test("Items renders chain-owned cards and supports one-family selection and clearing", async () => {
  const ownedItems = [
    item("shoes-1", "Shoes", "Shoes I", "10% speed"),
    item("shoes-2", "Shoes", "Shoes II", "20% speed"),
    item("dagger-1", "Dagger", "Dagger I", "10% damage"),
    item("shield-1", "Shield", "Shield I", "10% defense"),
  ];
  let state = { status: "ready", profileId: "player", ownedItems, effective: { Shoes: ownedItems[0] } };
  const changes = [];
  const equipment = {
    async refresh() { return state; },
    async select(assetId) { const selected = ownedItems.find(candidate => candidate.assetId === assetId); state = { ...state, effective: { ...state.effective, [selected.family]: selected } }; return state; },
    async clear(family) { const effective = { ...state.effective }; delete effective[family]; state = { ...state, effective }; return state; },
  };
  const documentRef = { createElement: () => new Element() };
  const ui = createItemsUi({ host: new Element(), opener: new Element(), equipmentProvider: async () => equipment,
    onState: next => changes.push(next), documentRef });
  await Promise.resolve(); await Promise.resolve();

  assert.match(ui.content.children[0].textContent, /Changes apply on the next player spawn/);
  assert.deepEqual(ui.content.children[1].children.map(group => group.children[0].textContent), ["Shoes", "Dagger", "Shield"]);
  const initialShoes = find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-1");
  assert.equal(initialShoes.type, "button");
  assert.equal(initialShoes.getAttribute("aria-pressed"), "true");
  assert.equal(initialShoes.children[0].src, "https://chain.example/shoes-1.png");

  const shoesTwo = find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-2");
  shoesTwo.dispatchEvent(new Event("click"));
  await Promise.resolve(); await Promise.resolve();
  const selectedShoes = find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-2");
  assert.equal(selectedShoes.getAttribute("aria-pressed"), "true");

  selectedShoes.dispatchEvent(new Event("click"));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-2").getAttribute("aria-pressed"), "false");
  assert.equal(changes.length, 3);
});
