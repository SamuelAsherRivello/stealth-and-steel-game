import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerrainRendering } from '../../../runtime/systems/environment/terrain-renderer.js';

function render(placements) {
  const tiles = placements.map(tile => ({ valid: true, spritePosition: { x: 0, y: 0 },
    frameSize: [64, 64], frame: 0, animation: [], ...tile }));
  const atlases = new Map(tiles.map(tile => [tile.image, tile.image]));
  return createTerrainRendering(tiles, atlases, {
    createSprite2DLayer: (atlas, options) => ({ atlas, ...options, sprites: [] }),
    addSprite2D: (layer, options) => { const sprite = { layer, ...options }; layer.sprites.push(sprite); return sprite; },
  });
}

test('Underground water draws static fill, then foam, then ground regardless of image encounter order', () => {
  const { terrainLayers, animatedTerrain } = render([
    { image: 'foam', layerName: 'Underground', layerIndex: 0, animation: [{ tileid: 0, duration: 100 }], frameSize: [192, 192], displaySize: [172.8, 172.8] },
    { image: 'water', layerName: 'Underground', layerIndex: 0 },
    { image: 'ground', layerName: 'Background', layerIndex: 1 },
  ]);
  const order = image => terrainLayers.find(layer => layer.atlas === image).order;
  assert.ok(order('water') < order('foam'), 'Static water must be behind animated foam');
  assert.ok(order('foam') < order('ground'), 'All Underground artwork must be behind ground');
  assert.equal(animatedTerrain.length, 1);
  assert.deepEqual(animatedTerrain[0].sprite.sizePx, [172.8, 172.8], 'Apply display scale independently from atlas sampling');
});

test('a shared atlas does not merge different Tiled layers or reorder their artwork', () => {
  const { terrainLayers } = render([
    { image: 'shared', layerName: 'Underground', layerIndex: 0 },
    { image: 'other', layerName: 'Background', layerIndex: 1 },
    { image: 'shared', layerName: 'Midground', layerIndex: 2 },
  ]);
  const ordered = [...terrainLayers].sort((a, b) => a.order - b.order);
  assert.deepEqual(ordered.map(layer => layer.atlas), ['shared', 'other', 'shared']);
  assert.ok(ordered[0].order < ordered[1].order && ordered[1].order < ordered[2].order);
});
