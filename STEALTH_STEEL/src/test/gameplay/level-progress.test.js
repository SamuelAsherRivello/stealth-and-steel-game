import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogFromFiles,createLevelProgress,RUN_STORAGE_KEY} from '../../runtime/gameplay/level-progress.js';
test('catalog ignores backups and sorts real levels; gaps fail explicitly',()=>{
  assert.deepEqual(catalogFromFiles(['Level02.tmj','Level01.tmj.bak.tmj','Level01.tmj']).map(l=>l.number),[1,2]);
  assert.throws(()=>catalogFromFiles(['Level01.tmj','Level03.tmj']),/contiguous/);
});
test('continue persists level, final omits next, restart preserves wallet',()=>{
  const values=new Map([['wallet','untouched']]);let reloads=0;
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const catalog=catalogFromFiles(['Level01.tmj','Level02.tmj']);
  const first=createLevelProgress(catalog,storage,()=>reloads++);assert.equal(first.current,1);assert.equal(first.hasNext,true);first.advance();
  const final=createLevelProgress(catalog,storage,()=>reloads++);assert.equal(final.current,2);assert.equal(final.completed,1);assert.equal(final.hasNext,false);final.advance();assert.equal(reloads,1);final.restart();
  assert.deepEqual(JSON.parse(values.get(RUN_STORAGE_KEY)),{current:1,completed:0});assert.equal(values.get('wallet'),'untouched');assert.equal(reloads,2);
});
test('failed storage never claims navigation',()=>{
  let reloads=0;const progress=createLevelProgress(catalogFromFiles(['Level01.tmj']),{getItem:()=>null,setItem:()=>{throw Error('storage');}},()=>reloads++);
  assert.throws(()=>progress.restart());assert.equal(reloads,0);
});
