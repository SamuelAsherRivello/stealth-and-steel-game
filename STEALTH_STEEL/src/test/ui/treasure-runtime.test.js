import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureRuntime} from '../../runtime/integration/treasure-runtime.js';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function setup(saved){
 const values=new Map(saved?[['stealth-steel-treasure-session-v1',JSON.stringify(saved)]]:[]),calls=[];
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 const current={context:{getState:()=>({profileId:'player',phase:'active'})},gameWallet:{getState:()=>({profileId:'game',status:'ready'})},lto:{start:async request=>{calls.push(['start',request]);return {status:'unavailable'};},checkContracts:async()=>({status:'ready',contracts:[]}),endSession:async id=>calls.push(['end',id]),reconcile:async()=>calls.push(['reconcile'])}};
 return {current,storage,calls};
}
test('game Start before BIS readiness remains skipped after the package finishes loading',async()=>{
 const s=setup();let current,resolve;const ready=new Promise(done=>{resolve=done;});
 const runtime=createTreasureRuntime({accountHost:{getSession:()=>current,ready:()=>ready},storage:s.storage});runtime.start();
 current=s.current;resolve(current);await tick();assert.equal(s.calls.filter(call=>call[0]==='start').length,0);
 assert.equal(runtime.getState().status,'missing-player');runtime.dispose();await tick();
});
test('progression and continuation preserve the same session and deadline, while menu entry ends it',async t=>{
 const now=Date.now(),saved={id:'run',reference:'treasure:run',playerId:'player',gameId:'game',expiresAt:now+90000,status:'active',offered:true,contractId:'offer'};
 const s=setup(saved),host={getSession:()=>s.current,ready:async()=>s.current};
 t.mock.method(Date,'now',()=>now+30000);
 const resumed=createTreasureRuntime({accountHost:host,storage:s.storage,resumeRun:true});resumed.start();await tick();
 assert.equal(resumed.getState().remainingSeconds,60);assert.equal(resumed.getState().sessionId,'run');assert.equal(s.calls.filter(call=>call[0]==='start').length,0);
 resumed.dispose({preserveSession:true});assert.equal(s.calls.filter(call=>call[0]==='end').length,0);
 const menu=createTreasureRuntime({accountHost:host,storage:s.storage});await tick();assert.deepEqual(s.calls.filter(call=>call[0]==='end'),[['end','run']]);menu.dispose();
});
test('repeated explicit Starts end the prior session and preserve no late replacement',async()=>{
 const s=setup(),host={getSession:()=>s.current,ready:async()=>s.current},runtime=createTreasureRuntime({accountHost:host,storage:s.storage});
 runtime.start();await tick();const first=runtime.getState().sessionId;runtime.start();await tick();
 assert.notEqual(runtime.getState().sessionId,first);assert.deepEqual(s.calls.filter(call=>call[0]==='end'),[['end',first]]);
 runtime.dispose();await tick();assert.equal(s.calls.filter(call=>call[0]==='end').length,2);
});
