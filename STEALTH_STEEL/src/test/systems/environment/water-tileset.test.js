import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {normalizeTiledMap,collectTiledLayerTiles} from '../../../../plugins/tiled-babylon-lite/index.js';
import {createLevelTerrainTiles} from '../../../../plugins/tiled-babylon-lite/terrain-runtime.js';
const base=new URL('../../../../public/assets/levels/tiled/',import.meta.url);
const json=url=>JSON.parse(readFileSync(url,'utf8'));
test('Water has two distinct static editor icons and runtime-only animation with one placement each',()=>{
 const url=new URL('maps/Level01.tmj',base),map=json(url);
 const sets=new Map(map.tilesets.map(r=>[r.source,json(new URL(r.source,url))]));
 const water=sets.get('../tilesets/Water.tsj');
 assert.equal(water.name,'Water');assert.equal(water.tilecount,2);
 assert.deepEqual(water.tiles.map(t=>t.type),['Water (Static)','Water (Animated)']);
 assert.notEqual(water.tiles[0].image,water.tiles[1].image);
 assert.ok(water.tiles.every(t=>!t.animation));
 const tiles=collectTiledLayerTiles(normalizeTiledMap(map,sets)).filter(t=>t.source==='../tilesets/Water.tsj' && t.layerName.startsWith('Water ('));
 assert.equal(tiles.length,2);assert.deepEqual(tiles.map(t=>t.gid),[160,161]);
 assert.equal(tiles[0].animation.length,0);assert.equal(tiles[1].animation.length,16);
 assert.deepEqual(tiles[1].frameSize,[192,192]);assert.equal(tiles[1].frame,0);
 const png=readFileSync(new URL(tiles[1].image,new URL('../tilesets/Water.tsj',url)));
 assert.equal(png.readUInt32BE(16),192*16);assert.equal(png.readUInt32BE(20),192);
 assert.ok(createLevelTerrainTiles(tiles,64,1024,new Set()).every(t=>t.valid && t.blocked === (t.animation.length === 0)));
});


test('wide animated water is centered on its authored cell in both axes', () => {
 const placements = [64, 192].map(width => ({frame:0,gameCell:{x:5,y:7},frameSize:[width,width]}));
 const [staticTile, animatedTile] = createLevelTerrainTiles(placements,64,1024,new Set());
 assert.deepEqual(staticTile.spritePosition,{x:320,y:512});
 assert.deepEqual(animatedTile.spritePosition,{x:256,y:448});
 assert.equal(animatedTile.spritePosition.x+192/2,staticTile.spritePosition.x+64/2);
 assert.deepEqual(animatedTile.screenPosition,{x:320,y:512});
});
