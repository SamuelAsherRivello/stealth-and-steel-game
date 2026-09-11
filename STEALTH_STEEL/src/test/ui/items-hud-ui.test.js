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

test("HUD can move from mixed to full slots without changing its Shoes, Dagger, Shield order", () => {
  const host=new Element();
  const hud=createItemsHudUi({host,documentRef,snapshot:{slots:{Dagger:{name:"Dagger II",effect:"20% damage",iconUrl:"https://chain.example/dagger.png"}}}});
  assert.equal(hud.element.children[1].textContent,"[]");
  assert.equal(hud.element.children[2].children[1].src,"https://chain.example/dagger.png");
  assert.equal(hud.element.children[3].textContent,"[]");
  hud.render({slots:{Shoes:{name:"Shoes III",effect:"30% speed",iconUrl:"https://chain.example/shoes.png"},Dagger:{name:"Dagger II",effect:"20% damage",iconUrl:"https://chain.example/dagger.png"},Shield:{name:"Shield I",effect:"10% defense",iconUrl:"https://chain.example/shield.png"}}});
  assert.deepEqual([hud.element.children[1].children[1].src,hud.element.children[2].children[1].src,hud.element.children[3].children[1].src],["https://chain.example/shoes.png","https://chain.example/dagger.png","https://chain.example/shield.png"]);
});
