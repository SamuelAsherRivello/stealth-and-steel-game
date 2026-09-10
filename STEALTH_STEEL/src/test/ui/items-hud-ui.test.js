import test from "node:test";
import assert from "node:assert/strict";
import { createItemsHudUi } from "../../runtime/ui/items-hud-ui.js";

class Element { children=[]; attributes=new Map(); textContent=""; append(...items){this.children.push(...items);} setAttribute(key,value){this.attributes.set(key,String(value));} }
const documentRef={createElement:()=>new Element()};

test("HUD shows three ordered empty slots and chain icons for selected items", () => {
  const host=new Element();
  const hud=createItemsHudUi({host,documentRef,snapshot:{slots:{Shoes:{name:"Shoes I",effect:"10% speed",iconUrl:"https://chain.example/shoes.png"}}}});
  assert.equal(hud.element.children[0].textContent,"Items: ");
  assert.equal(hud.element.children[1].children[1].src,"https://chain.example/shoes.png");
  assert.equal(hud.element.children[2].textContent,"[]");
  assert.equal(hud.element.children[3].textContent,"[]");
});
