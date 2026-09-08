import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {normalizeTiledMap,validateTiledMap} from '../../../../plugins/tiled-babylon-lite/index.js';

test('Level02 has a clear floor route from its player through gold to its exit',async()=>{
  const url=new URL('../../../../public/assets/levels/tiled/maps/Level02.tmj',import.meta.url);
  const map=JSON.parse(await readFile(url,'utf8'));
  const tilesets=new Map(await Promise.all(map.tilesets.map(async({source})=>[source,JSON.parse(await readFile(new URL(source,url),'utf8'))])));
  assert.deepEqual(validateTiledMap(map),[]);
  const level=normalizeTiledMap(map,tilesets);
  assert.equal(level.spawners.length,1);
  const player=level.spawners.find(s=>s.type==='PLAYER');
  const goal=level.goals[0];
  assert.equal(player.gameCell.x,goal.gameCell.x);
  assert.ok(goal.gameCell.y>player.gameCell.y);
  assert.equal(level.goldPickupSpawners.length,3);
  for(const gold of level.goldPickupSpawners){
    assert.equal(gold.gameCell.x,player.gameCell.x);
    assert.ok(gold.gameCell.y>player.gameCell.y&&gold.gameCell.y<goal.gameCell.y);
  }
  // The straight route uses an existing floor tile with no collision shapes.
  const floor=tilesets.get('../tilesets/Tilemap_color3.tsj');
  assert.equal(floor.tiles.find(t=>t.id===15)?.objectgroup?.objects?.length??0,0);
  for(let row=3;row<=12;row++){
    assert.equal(map.layers.find(l=>l.name==='Background').data[row*9+4],16);
    for(const layer of map.layers.filter(l=>l.type==='tilelayer'&&l.name!=='Background'))assert.equal(layer.data[row*9+4],0);
  }
});
