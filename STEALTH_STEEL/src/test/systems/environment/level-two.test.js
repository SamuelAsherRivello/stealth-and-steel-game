import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {normalizeTiledMap,validateTiledMap} from '../../../../plugins/tiled-babylon-lite/index.js';

test('Level02 keeps its authored player, exit and gold pickup layout',async()=>{
  const url=new URL('../../../../public/assets/levels/tiled/maps/Level02.tmj',import.meta.url);
  const map=JSON.parse(await readFile(url,'utf8'));
  const tilesets=new Map(await Promise.all(map.tilesets.map(async({source})=>[source,JSON.parse(await readFile(new URL(source,url),'utf8'))])));
  assert.deepEqual(validateTiledMap(map),[]);
  const level=normalizeTiledMap(map,tilesets);
  assert.equal(level.spawners.length,1);
  const player=level.spawners.find(s=>s.type==='PLAYER');
  const goal=level.goals[0];
  assert.deepEqual(player.gameCell,{x:26,y:9});
  assert.deepEqual(goal.gameCell,{x:4,y:12});
  assert.equal(level.goldPickupSpawners.length,21);
  assert.deepEqual(
    level.goldPickupSpawners.map(({gameCell})=>gameCell),
    [
      {x:4,y:5},{x:4,y:7},{x:4,y:9},
      {x:19,y:15},{x:21,y:15},{x:20,y:15},{x:22,y:15},{x:23,y:15},
      {x:19,y:9},{x:21,y:9},{x:22,y:9},{x:18,y:9},{x:20,y:9},{x:18,y:9},
      {x:17,y:11},{x:17,y:12},{x:17,y:13},{x:17,y:10},
      {x:18,y:14},{x:24,y:14},{x:24,y:13},
    ],
  );
});
