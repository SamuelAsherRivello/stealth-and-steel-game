import assert from 'node:assert/strict';
import test from 'node:test';
import {getColumnAnimationOffset} from '../../../../plugins/tiled-babylon-lite/terrain-runtime.js';
test('water offsets two frames per world column and wraps across the animation',()=>{
 const frames=Array.from({length:16},(_,tileid)=>({tileid,duration:100}));
 for(const [column,frame] of [[0,0],[1,2],[7,14],[8,0],[15,14],[16,0],[18,4],[-1,14]]) {
  assert.deepEqual(getColumnAnimationOffset(frames,column),{frame,elapsed:frame*100});
 }
});
