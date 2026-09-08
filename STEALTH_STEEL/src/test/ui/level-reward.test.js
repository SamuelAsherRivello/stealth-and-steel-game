import test from 'node:test';
import assert from 'node:assert/strict';
import {createLevelReward,trophyForLevel} from '../../runtime/integration/level-reward.js';
import {createLevelCompleteUi} from '../../runtime/ui/level-complete-ui.js';
class Element extends EventTarget {
  children=[];hidden=false;parentNode=null;_text='';
  set textContent(value){this._text=value;this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  append(...children){for(const child of children){child.parentNode=this;this.children.push(child);}}
  setAttribute(){}focus(){}remove(){this.parentNode?.children.splice(this.parentNode.children.indexOf(this),1);}
}
const documentRef={createElement:()=>new Element()};
test('completion snapshot renders exact level/final bodies and action gating',()=>{
  const host=new Element();let collects=0,next=0,restarts=0;
  const ui=createLevelCompleteUi({host,documentRef,onCollect:()=>collects++,onContinue:()=>next++,onRestart:()=>restarts++});
  ui.setCompletion({levelNumber:1,totalLevels:2,hasNext:true,collected:3,total:100});ui.show();
  assert.equal(ui.panel.children[0].textContent,'Level Completed');assert.match(ui.panel.children[1].textContent,/03\/100 gold/);
  ui.setState({canCollect:true,status:'available',message:''});ui.collectButton.dispatchEvent(new Event('click'));assert.equal(collects,1);
  ui.setState({busy:true});for(const b of [ui.collectButton,ui.continueButton,ui.restartButton]){assert.equal(b.disabled,true);b.dispatchEvent(new Event('click'));}assert.equal(collects,1);assert.equal(next+restarts,0);
  ui.setState({busy:false,status:'owned',canCollect:false});assert.equal(ui.backdrop.hidden,false);assert.equal(ui.continueButton.disabled,false);
  assert.equal(ui.panel.children[1].textContent,'Great jobs. You collected 03/100 gold and reached the exit. You already own this trophy.');
  assert.ok(!ui.panel.children.some(child=>child.className==='level-complete-status'));
  ui.setCompletion({levelNumber:2,levelsCompleted:2,totalLevels:2,hasNext:false});assert.equal(ui.panel.children[0].textContent,'Game Completed');assert.match(ui.panel.children[1].textContent,/2\/2 levels/);assert.equal(ui.continueButton.hidden,true);assert.equal(ui.restartButton.textContent,'Restart Game');ui.dispose();
});
test('flow snapshots HUD and late initialization cannot attach to a disposed screen',async()=>{
  let resolve,disposed=0,snapshot,shows=0;
  const ui={setCompletion:v=>snapshot=v,show:()=>shows++,setState:()=>{throw Error('late UI write');}};
  const flow=createLevelReward({ui,progress:{current:2,total:2,hasNext:false},gold:{collected:42,total:99},accountHost:{createAssetCollection:()=>new Promise(r=>resolve=r)}});
  flow.show();flow.show();flow.dispose();resolve({dispose:()=>disposed++});await new Promise(r=>setTimeout(r,0));
  assert.equal(shows,1);assert.equal(snapshot.collected,42);assert.equal(snapshot.total,99);assert.equal(disposed,1);
});
test('unconfigured trophy never initializes wallet and navigation remains available',()=>{
  assert.equal(trophyForLevel(4),null);let next=0;const states=[];
  const flow=createLevelReward({ui:{show(){},setCompletion(){},setState:s=>states.push(s)},progress:{current:4,total:5,hasNext:true,advance:()=>next++},gold:{collected:0,total:0},accountHost:{createAssetCollection:()=>{throw Error('wallet called');}}});
  flow.show();flow.next();assert.equal(next,1);assert.equal(states[0].canCollect,false);flow.dispose();
});
