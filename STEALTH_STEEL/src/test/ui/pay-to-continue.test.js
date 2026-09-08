import test from 'node:test';
import assert from 'node:assert/strict';
import {createPayToContinue} from '../../runtime/integration/pay-to-continue.js';

function fixture() {
 let state={sats:2345,canPay:true,status:'idle',message:''},options,pays=0,revives=0,restarts=0,visible=false,disposed=0;
 const listeners=new Set(),states=[];
 const controller={getState:()=>state,subscribe:l=>{listeners.add(l);return()=>listeners.delete(l);},pay:async()=>{pays++;state={...state,status:'pending',canPay:false};for(const l of listeners)l();},dispose:()=>disposed++};
 const host={createContinue:async o=>{options=o;return controller;}};
 const ui={setState:s=>states.push(s),show:()=>visible=true,hide:()=>visible=false};
 const flow=createPayToContinue({accountHost:host,ui,revive:()=>{revives++;return true;},restart:()=>restarts++,newId:()=> 'loss'});
 return {flow,states,success:()=>options.onSuccess(),stats:()=>({pays,revives,restarts,visible,disposed})};
}
test('loss uses BIS price, blocks restart pending, and delivers gameplay consequence only once',async()=>{
 const f=fixture();await f.flow.show();assert.equal(f.states.at(-1).sats,2345);await f.flow.pay();f.flow.restart();assert.equal(f.stats().restarts,0);
 f.success();f.success();assert.equal(f.stats().revives,1);assert.equal(f.stats().visible,false);f.flow.dispose();
});
test('closing or restarting drops the old callback',async()=>{
 for(const end of ['dispose','restart']){const f=fixture();await f.flow.show();f.flow[end]();f.success();assert.equal(f.stats().revives,0);}
});
