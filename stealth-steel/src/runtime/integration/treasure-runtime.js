import {createTreasureSession} from './treasure-session.js';
const key='stealth-steel-treasure-session-v1';
export function createTreasureRuntime({accountHost,resumeRun=false,storage=globalThis.sessionStorage}) {
  const current=()=>accountHost.getSession?.();
  const unavailable=async()=>({status:'unavailable',contracts:[]});
  const offers={
    start:request=>current()?.lto?.start(request)??unavailable(),
    checkContracts:filter=>current()?.lto?.checkContracts(filter)??unavailable(),
    claim:id=>current()?.lto?.claim(id)??unavailable(),reject:id=>current()?.lto?.reject(id)??unavailable(),
    endSession:async id=>{const ready=await accountHost.ready();await ready?.lto?.endSession(id);},
  };
  const session=createTreasureSession({context:{getState:()=>current()?.context.getState()??{}},gameWallet:{getState:()=>current()?.gameWallet?.getState()??{}},offers});
  let saved;
  try{saved=JSON.parse(storage.getItem(key)??'null');}catch{/* Gameplay remains available without storage. */}
  if(resumeRun)session.restore(saved);
  else if(saved?.id)void offers.endSession(saved.id).catch(()=>{});
  const persist=()=>{try{storage.setItem(key,JSON.stringify(session.snapshot()??null));}catch{/* No replacement can be created without an explicit Start. */}};
  const unsubscribe=session.subscribe(persist);persist();
  void accountHost.ready().then(ready=>{void ready?.lto?.reconcile();void session.inspect();}).catch(()=>{});
  return {...session,start(){if(!resumeRun||!session.snapshot())session.start();},dispose({preserveSession=false}={}){unsubscribe();session.dispose({preserveSession});if(!preserveSession)persist();}};
}
