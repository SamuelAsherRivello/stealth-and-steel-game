import { collidersOverlap } from './game-logic.js';
import { PLAYER_PAWN_ANIMATION_CATALOG, PLAYER_WEAPON_DAMAGE } from '../characters/player/player-pawn-catalog.js';
import { SpawnerType } from '../systems/spawners/spawner-catalog.js';

const animation = PLAYER_PAWN_ANIMATION_CATALOG.weapons.knife.attack;
const duration = animation.frameCount * animation.frameDurationMs / 1000;

// One game-time clock drives both the displayed knife frame and its damage event.
export function createKnifeSwing() {
  let active = false, elapsed = 0, released = false;
  return {
    get active() { return active; },
    get frame() { return Math.min(animation.frameCount - 1, Math.floor((elapsed + 1e-9) * 1000 / animation.frameDurationMs)); },
    start() {
      if (active) return false;
      active = true; elapsed = 0; released = false;
      return true;
    },
    cancel() { active = false; },
    advance(deltaSeconds) {
      if (!active) return { impact: false, completed: false };
      elapsed = Math.min(duration, elapsed + Math.max(0, deltaSeconds));
      const impact = !released && elapsed + 1e-9 >= duration / 2;
      if (impact) released = true;
      const completed = elapsed + 1e-9 >= duration;
      if (completed) active = false;
      return { impact, completed };
    },
  };
}

export function resolvePlayerKnifeImpact(player, enemies) {
  if (!player?.combat.isAlive) return;
  const collider = player.combat.getCombatCollider();
  if (!collider) return;
  const from = player.actor.getPosition();
  for (const enemy of enemies) {
    if (enemy.type !== SpawnerType.ENEMY || !enemy.combat.isAlive) continue;
    const target = enemy.combat.getCombatCollider();
    if (!target || !collidersOverlap(collider, target)) continue;
    const to = enemy.actor.getPosition();
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const direction = length ? { x: (to.x - from.x) / length, y: (to.y - from.y) / length } : { x: 1, y: 0 };
    enemy.combat.applyDamage(PLAYER_WEAPON_DAMAGE.knife, direction);
  }
}
