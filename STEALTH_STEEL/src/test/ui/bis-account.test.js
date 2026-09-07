import test from 'node:test';
import assert from 'node:assert/strict';
import {createBisAccount} from '../../runtime/integration/bis-account.js';
import {createPauseController} from '../../runtime/ui/pause-controller.js';
class Element extends EventTarget {
  children=[];hidden=false;inert=false;
  append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
  setAttribute(){} focus(){} querySelectorAll(){return [];} contains(el){return el===this||this.children.some(c=>c.contains(el));}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
}
function fixture({load,ready=Promise.resolve(),timeoutMs=100}={}) {
  const documentRef=new EventTarget();documentRef.createElement=()=>new Element();
  const host=new Element(),other=new Element();host.append(other);let closes=0,restarts=0,creates=0,mounts=0,disposals=0;
  let state={view:'empty'};const listeners=new Set(),events=new Set();
  const publish=view=>{state={view};for(const listener of listeners)listener();};
  const context={getState:()=>state,ready:()=>ready,subscribe:l=>{listeners.add(l);return()=>listeners.delete(l);},onEvent:l=>{events.add(l);return()=>events.delete(l);},openAccountDialog:()=>publish('account'),dispose:()=>{disposals++;}};
  const api={createBisContext:()=>{creates++;return context;},createBisUi:()=>({mount:()=>mounts++,unmount:()=>mounts--})};
  const pause=createPauseController();pause.pause('settings');
  const adapter=createBisAccount({host,pauseController:pause,documentRef,load:load??(()=>Promise.resolve(api)),timeoutMs,onClose:()=>closes++,restartGame:()=>restarts++});
  const overlay=host.children[1],back=overlay.children[0].children[1];
  return {adapter,api,publish,emit:e=>{for(const listener of events)listener(e);},back,overlay,pause,other,counts:()=>({closes,restarts,creates,mounts,disposals,listeners:listeners.size,events:events.size})};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('initial hydration stays open; duplicate opens reuse one context; nested Back does not close',async()=>{
 let release;const f=fixture({ready:new Promise(r=>release=r)});const work=f.adapter.open();await flush();
 assert.equal(f.overlay.children[0].hidden,true);
 assert.equal(f.overlay.children[0].children[0].textContent,'');
 f.publish('empty');await flush();assert.equal(f.adapter.isOpen,true);release();await work;
 await f.adapter.open();assert.equal(f.counts().creates,1);assert.equal(f.counts().mounts,1);assert.equal(f.other.inert,true);
 f.publish('account');await flush();assert.equal(f.counts().closes,0);
 f.publish('empty');await flush();assert.equal(f.counts().closes,1);assert.equal(f.pause.isPaused,true);assert.equal(f.other.inert,false);
 await f.adapter.open();assert.equal(f.counts().creates,1);f.adapter.dispose();assert.equal(f.counts().listeners,0);assert.equal(f.counts().events,0);assert.equal(f.counts().mounts,0);
});
test('loading timeout and import failure retain Back and never block final gameplay resume',async()=>{
 for(const load of [()=>new Promise(()=>{}),()=>Promise.reject(Error('fixture failure'))]){
 const f=fixture({load,timeoutMs:5});await f.adapter.open();assert.equal(f.overlay.hidden,false);assert.match(f.overlay.children[0].children[0].textContent,/unavailable/);
 f.back.dispatchEvent(new Event('click'));assert.equal(f.counts().closes,1);f.pause.resume('settings');assert.equal(f.pause.isPaused,false);f.adapter.dispose();}
});
test('dispose during import or hydration prevents late mounting',async()=>{
 let release;const f=fixture({ready:new Promise(r=>release=r)});const work=f.adapter.open();await flush();f.adapter.dispose();release();await work;assert.equal(f.counts().mounts,0);assert.equal(f.counts().disposals,1);
 let finish;const g=fixture({load:()=>new Promise(r=>finish=r)});const pending=g.adapter.open();g.adapter.dispose();finish(g.api);await pending;assert.equal(g.counts().creates,0);
});
test('restart is host-owned and deduplicated without returning to Settings or resuming',async()=>{
 const f=fixture();await f.adapter.open();f.publish('empty');f.emit({type:'restartRequested',reason:'logout',logoutId:'one'});f.emit({type:'restartRequested',reason:'logout',logoutId:'one'});await flush();
 assert.equal(f.counts().restarts,1);assert.equal(f.counts().closes,0);assert.equal(f.pause.isPaused,true);f.adapter.dispose();
});
