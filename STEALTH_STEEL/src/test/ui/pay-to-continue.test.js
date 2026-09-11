import test from 'node:test';
import assert from 'node:assert/strict';
import {createPayToContinue} from '../../runtime/integration/pay-to-continue.js';

function fixture() {
 let state={sats:2345,canPay:true,status:'idle',message:''},options,pays=0,restarts=0,visible=false,disposed=0;
 const listeners=new Set(),states=[];
 const controller={getState:()=>state,subscribe:l=>{listeners.add(l);return()=>listeners.delete(l);},pay:async()=>{pays++;state={...state,status:'pending',canPay:false};for(const l of listeners)l();},dispose:()=>disposed++};
 const host={createContinue:async o=>{options=o;return controller;}};
 const ui={setState:s=>states.push(s),show:()=>visible=true,hide:()=>visible=false};
 const flow=createPayToContinue({accountHost:host,ui,restart:()=>restarts++});
 return {flow,states,receipt:status=>options.onEffectReceipt({status}),stats:()=>({pays,restarts,visible,disposed})};
}
test('loss uses BIS price, blocks restart pending, and closes only after an applied host receipt',async()=>{
 const f=fixture();await f.flow.show();assert.equal(f.states.at(-1).sats,2345);await f.flow.pay();f.flow.restart();assert.equal(f.stats().restarts,0);
 f.receipt('not-applicable');assert.equal(f.stats().visible,true);f.receipt('applied');f.receipt('applied');assert.equal(f.stats().visible,false);f.flow.dispose();
});
test('closing or restarting drops the old callback',async()=>{
 for(const end of ['dispose','restart']){const f=fixture();await f.flow.show();f.flow[end]();f.receipt('applied');assert.notEqual(f.stats().visible,false);}
});
