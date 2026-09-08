import { addSprite2D, createSprite2DLayer } from '@babylonjs/lite';
import { TILE_MAP_SUB_Z } from './render-depth.js';

export function createTerrainRendering(tiles, atlases, api = { addSprite2D, createSprite2DLayer }) {
  const groundIndices = [...new Set(tiles.filter(tile => tile.layerName !== 'Underground')
    .map(tile => tile.layerIndex))].sort((a, b) => a - b);
  const groups = new Map();
  for (const tile of tiles) {
    if (!tile.valid) continue;
    // Keep authored layers separate even when they share a texture atlas.
    const key = JSON.stringify([tile.layerIndex, tile.layerName, tile.image, !!tile.animation.length]);
    if (!groups.has(key)) groups.set(key, { tile, tiles: [] });
    groups.get(key).tiles.push(tile);
  }
  const terrainLayers = [];
  const animatedTerrain = [];
  for (const group of groups.values()) {
    const { tile: first } = group;
    const rank = groundIndices.indexOf(first.layerIndex);
    const baseOrder = first.layerName === 'Underground' ? TILE_MAP_SUB_Z.backgroundWater
      : TILE_MAP_SUB_Z.ground + rank * (TILE_MAP_SUB_Z.foregroundArtwork - TILE_MAP_SUB_Z.ground) / Math.max(1, groundIndices.length);
    const layer = api.createSprite2DLayer(atlases.get(first.image), {
      capacity: group.tiles.length,
      // Foam sits over static fill, while the whole Underground stays below ground.
      order: baseOrder + (first.animation.length ? (first.layerName === 'Underground' ? 10 : 0.5) : 0),
      pivot: [0, 0],
    });
    terrainLayers.push(layer);
    for (const tile of group.tiles) {
      const sprite = api.addSprite2D(layer, {
        positionPx: [tile.spritePosition.x, tile.spritePosition.y],
        sizePx: tile.displaySize ?? tile.frameSize,
        frame: tile.frame,
      });
      if (tile.animation.length) animatedTerrain.push({ sprite, frames: tile.animation, elapsed: 0, tile });
    }
  }
  return { terrainLayers, animatedTerrain };
}
