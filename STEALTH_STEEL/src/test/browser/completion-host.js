import {createBisAssetCollection,createBisContext,createBisUi} from '@bis/integration';
import '@bis/integration/style.css';
import {createLevelCompleteUi} from '../../runtime/ui/level-complete-ui.js';
import {createLevelReward} from '../../runtime/integration/level-reward.js';
const mode=new URLSearchParams(location.search).get('mode')??'success';
const context=createBisContext();await context.ready();const client=createBisUi(context);client.mount(document.getElementById('toast'));
let pending=null,calls=0,holdings=mode==='owned'?[{assetId:'old',quantity:'1',name:'Achievement: Level 1',ticker:'LVL1',decimals:0}]:[];
const mock={...context,getState:()=>({...context.getState(),phase:'active',hasProfile:mode!=='guest',profileId:mode==='guest'?undefined:'fixture'}),
  listAssets:async()=>({status:'success',profileId:'fixture',assets:holdings}),getPendingAssetMint:async()=>({status:'success',profileId:'fixture',request:pending}),
  mintAsset:async request=>{calls++;pending=request;await new Promise(r=>setTimeout(r,500));
    if(mode==='uncertain'&&calls===1)return {status:'error',code:'outcome-unknown',message:'Test uncertainty'};
    if(mode==='error'){pending=null;return {status:'error',code:'insufficient-funds',message:'Insufficient spendable funds.'};}
    const asset={...request,assetId:'fixture-mint',quantity:'1'};holdings=[asset];pending=null;
    return {status:'minted',profileId:'fixture',operationId:request.operationId,asset};}};
let ui,flow,nexts=0,restarts=0;
ui=createLevelCompleteUi({host:document.getElementById('host'),onCollect:()=>flow.collect(),onCheck:()=>flow.check(),onAcknowledge:()=>flow.acknowledge(),onContinue:()=>flow.next(),onRestart:()=>flow.restart()});
flow=createLevelReward({accountHost:{createAssetCollection:async options=>createBisAssetCollection(mock,options)},ui,
  progress:{current:1,total:2,hasNext:true,advance:()=>nexts++,restart:()=>restarts++},gold:{collected:7,total:15}});
flow.show();
Object.assign(window,{completionFixture:{calls:()=>calls,nexts:()=>nexts,restarts:()=>restarts}});
window.addEventListener('pagehide',()=>{flow.dispose();ui.dispose();client.unmount();context.dispose();},{once:true});
