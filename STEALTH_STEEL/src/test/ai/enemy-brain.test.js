import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEnemyBrain } from '../../runtime/ai/enemy-brain.js';
import { createEnemyProfile, validateCapabilities } from '../../runtime/ai/enemy-profile.js';
import { createNavigation, createReachabilitySearch } from '../../runtime/ai/navigation.js';
import { createPlanningScheduler } from '../../runtime/ai/planning-scheduler.js';
import { updatePlayerAttackPreparation } from '../../runtime/characters/enemies/player-attack-preparation.js';
import { goblinProfile } from '../../runtime/characters/enemies/goblin/goblin-goap.js';
import { warriorProfile } from '../../runtime/characters/enemies/warrior/warrior-goap.js';
import { lancerProfile } from '../../runtime/characters/enemies/lancer/lancer-goap.js';
import { archerProfile } from '../../runtime/characters/enemies/archer/archer-goap.js';
import { monkProfile } from '../../runtime/characters/enemies/monk/monk-goap.js';

const grid = { tileSizePx: 64, columns: 12, rows: 12 };
function fixture(profile = warriorProfile, options = {}) {
  let position = { x: 160, y: 160 }, intent = { x: 0, y: 0 }, alive = true, lock = 0, defending = false;
  let player = { id: 'player', isAlive: true, hidden: false, detected: false, position: { x: 224, y: 160 }, cell: { x: 3, y: 2 } };
  const attacks = [], actor = {
    getPosition: () => ({ ...position }), getGridPosition: size => ({ x: Math.floor(position.x / size), y: Math.floor(position.y / size) }),
    getMovementCollider: () => ({ type: 'circle', ...position, radius: 24 }),
    getCombatCollider: () => ({ x: position.x - 32, y: position.y - 32, width: 64, height: 64 }),
    setMovementIntent: value => { intent = { ...value }; }, faceDirection() {},
    attack(...args) { attacks.push({ position: { ...position }, args }); lock = 0.5; return true; },
    shootAt(target) { attacks.push({ position: { ...position }, target: { ...target } }); lock = 1.35; return true; },
    isMovementLocked: () => lock > 0 || defending, get isAttacking() { return lock > 0; }, get isDefending() { return defending; },
  };
  const brain = createEnemyBrain({ id: options.id ?? 'enemy', actor, grid, profile, getPlayer: () => player,
    random: () => 0, isAlive: () => alive, isWalkable: () => true, ...options });
  return { actor, brain, attacks, get intent() { return intent; }, get player() { return player; },
    set player(value) { player = value; }, set position(value) { position = value; }, set alive(value) { alive = value; }, set defending(value) { defending = value; },
    tick(delta = 0.1) {
      brain.reaction.update(delta); brain.update(delta);
      if (delta <= 0) return;
      if (lock > 0) { lock = Math.max(0, lock - delta); return; }
      if (defending) return;
      if (!updatePlayerAttackPreparation(actor, delta, center => { position = { ...center }; })) {
        position.x += intent.x * 120 * delta; position.y += intent.y * 120 * delta;
      }
    },
  };
}

test('profiles validate capabilities and immutable enemy-specific parameters', () => {
  assert.throws(() => createEnemyProfile({ idleSeconds: [4, 2] }), /idleSeconds/);
  assert.throws(() => createEnemyProfile({ actions: ['teleport'] }), /action/);
  assert.throws(() => createEnemyProfile({ costs: { melee: -1 } }), /cost/);
  assert.throws(() => validateCapabilities(archerProfile, { setMovementIntent() {}, faceDirection() {} }), /ranged/);
  assert.equal(Object.isFrozen(goblinProfile.idleSeconds), true);
  assert.equal(monkProfile.actions.includes('melee'), false);
});

test('all combat profiles immediately center and commit; Monk remains passive', () => {
  for (const profile of [goblinProfile, warriorProfile, lancerProfile, archerProfile, monkProfile]) {
    const f = fixture(profile); f.position = { x: 161, y: 160 }; f.tick();
    assert.equal(f.attacks.length, profile === monkProfile ? 0 : 1, profile.id);
    if (f.attacks.length) assert.deepEqual(f.attacks[0].position, { x: 160, y: 160 });
    f.brain.dispose();
  }
});

test('adjacency bypasses exhausted ordinary planning, while committed attacks survive knowledge changes', () => {
  const scheduler = createPlanningScheduler({ maxExpansions: 1 });
  scheduler.request('busy', () => ({ expanded: 1 })); scheduler.beginFrame();
  const f = fixture(warriorProfile, { scheduler }); f.tick(); assert.equal(f.attacks.length, 1);
  f.player.hidden = true; f.brain.reaction.forceState('INVESTIGATING'); f.tick();
  assert.equal(f.brain.getNavigationSnapshot().action, 'attacking');
  assert.equal(f.attacks.length, 1);
  f.defending = true; f.tick(); assert.equal(f.brain.getNavigationSnapshot().action, 'defense');
  f.brain.dispose();
});

test('knowledge is isolated and hidden tracking expires before another current hidden coordinate is consumed', () => {
  const a = fixture(), b = fixture();
  for (const f of [a, b]) { f.player.hidden = true; f.player.position = { x: 480, y: 160 }; f.player.cell = { x: 7, y: 2 }; }
  a.brain.reaction.acceptDetection({ type: 'visual', strength: 1, cell: { x: 5, y: 2 } });
  a.tick(); b.tick();
  assert.deepEqual(a.brain.reaction.getSnapshot().lastKnownCell, { x: 7, y: 2 });
  assert.equal(b.brain.reaction.getSnapshot().lastKnownCell, null);
  a.player.cell = { x: 8, y: 2 }; a.player.position.x = 544;
  a.tick(3.1);
  assert.deepEqual(a.brain.reaction.getSnapshot().lastKnownCell, { x: 7, y: 2 });
  assert.notDeepEqual(a.brain.getNavigationSnapshot().target, { x: 8, y: 2 });
  const snapshot = a.brain.getNavigationSnapshot(); assert.equal(Object.isFrozen(snapshot.plan), true);
  a.brain.dispose(); b.brain.dispose();
});

test('Archer composes move then ranged outside range; close Archer stands and shoots without retreat', () => {
  const far = fixture(archerProfile); far.player.position.x = 608; far.player.cell.x = 9; far.player.detected = true;
  far.tick(); assert.deepEqual(far.brain.getNavigationSnapshot().plan, ['move-to', 'ranged']);
  assert.equal(far.attacks.length, 0); assert.equal(far.intent.x, 1);
  const close = fixture(archerProfile); close.tick(); assert.equal(close.attacks.length, 1); assert.deepEqual(close.intent, { x: 0, y: 0 });
  far.brain.dispose(); close.brain.dispose();
});

test('investigation travel and looking share one clock; repeated detection has no repeated entry freeze', () => {
  const f = fixture(monkProfile); f.player = null;
  f.brain.reaction.acceptDetection({ type: 'audio', strength: 1, cell: { x: 8, y: 2 } });
  f.tick(); assert.deepEqual(f.intent, { x: 0, y: 0 });
  f.tick(); assert.equal(f.intent.x, 1);
  const before = f.brain.reaction.getSnapshot().remainingSeconds;
  f.brain.reaction.acceptDetection({ type: 'audio', strength: 1, cell: { x: 8, y: 2 } });
  f.tick(); assert.equal(f.intent.x, 1); assert.ok(f.brain.reaction.getSnapshot().remainingSeconds < before);
  for (let i = 0; i < 80; i++) f.tick();
  assert.equal(f.brain.reaction.getSnapshot().state, 'SUSPICIOUS'); f.brain.dispose();
});

test('burns bind living bushes and deliver exactly one 50-damage event per committed action', () => {
  let damage = 0, alive = true;
  const bush = { id: 'bush', isAlive: true, cell: { x: 3, y: 2 }, position: { x: 224, y: 160 },
    combatCollider: { x: 192, y: 128, width: 64, height: 64 }, applyFireDamage(value) { damage += value; alive = false; } };
  const f = fixture(createEnemyProfile({ ...goblinProfile, idleSeconds: [0, 0] }), {
    getWorld: () => ({ characters: [], bushes: alive ? [bush] : [] }),
  }); f.player = null;
  f.tick(); f.tick(); assert.equal(damage, 50); assert.equal(f.attacks.length, 1);
  for (let i = 0; i < 40; i++) f.tick();
  assert.equal(damage, 50); assert.equal(f.attacks.length, 1); f.brain.dispose();
});

test('navigation honors world grid origins, deferred scans and dynamic invalidation', () => {
  const search = createReachabilitySearch({ x: -2, y: -2 }, { columns: 4, rows: 4, minColumn: -2, minRow: -2 }, () => true);
  assert.equal(search.step(1).done, false);
  const done = search.step(100); assert.equal(done.candidates.length, 16);
  const f = fixture(); let walkable = true;
  const nav = createNavigation({ actor: f.actor, grid, isWalkable: () => walkable });
  nav.start(candidates => candidates.find(x => x.cell.x === 4 && x.cell.y === 2));
  assert.equal(nav.update(0.1), 'running'); walkable = false;
  assert.equal(nav.update(0.1), 'failed'); assert.deepEqual(f.intent, { x: 0, y: 0 }); f.brain.dispose();
});

test('enclosed enemies make a bounded escape attempt then wait three active seconds; pause and death stop work', () => {
  const f = fixture(createEnemyProfile({ ...monkProfile, idleSeconds: [0, 0] }), { isWalkable: () => false }); f.player = null;
  f.tick(); f.tick(); f.tick(); f.tick();
  assert.equal(f.brain.getNavigationSnapshot().goal, 'retry');
  const remaining = f.brain.getNavigationSnapshot().retryRemaining;
  f.tick(0); assert.equal(f.brain.getNavigationSnapshot().retryRemaining, remaining);
  for (let i = 0; i < 20; i++) f.tick();
  assert.equal(f.brain.getNavigationSnapshot().goal, 'retry');
  f.alive = false; f.tick(); assert.equal(f.brain.getNavigationSnapshot().disposed, true); assert.deepEqual(f.intent, { x: 0, y: 0 });
});

test('real spawn wiring attaches GOAP exclusively for every enemy factory', () => {
  const source = readFileSync(new URL('../../runtime/main.js', import.meta.url), 'utf8');
  assert.match(source, /record\.brain = createEnemyBrain/);
  assert.match(source, /record\.controller = record\.awareness = record\.brain/);
  for (const enemy of ['Archer', 'Goblin', 'Warrior', 'Lancer', 'Monk']) assert.match(source, new RegExp(`function create${enemy}Record`));
  assert.doesNotMatch(source, /createEnemyPatrolController|createEnemyAwarenessController|createGoblinBehaviorController/);
  const archer = readFileSync(new URL('../../runtime/characters/enemies/archer/archer.js', import.meta.url), 'utf8');
  assert.doesNotMatch(archer, /chooseArcherAction|requestPlayerAttack|autonomous/);
});

test('20 mixed brains respect planning and navigation caps across repeated blockage and resume', () => {
  const scheduler = createPlanningScheduler({ maxExpansions: 8, maxNavigation: 128 });
  let blocked = false;
  const profiles = [goblinProfile, warriorProfile, lancerProfile, archerProfile, monkProfile];
  const roster = Array.from({ length: 20 }, (_, i) => fixture(createEnemyProfile({ ...profiles[i % 5], idleSeconds: [0,0], bushChance: 0 }),
    { id: `load-${i}`, scheduler, isWalkable: () => !blocked }));
  roster.forEach(f => { f.player = null; });
  const moved = new Set(); let maxPending = 0;
  for (let frame = 0; frame < 900; frame++) {
    blocked = frame >= 200 && frame < 600;
    scheduler.beginFrame();
    roster.forEach((f,i) => { f.tick(1/60); if (f.intent.x || f.intent.y) moved.add(i); });
    const work = scheduler.snapshot(); maxPending = Math.max(maxPending, work.pending);
    assert.ok(work.expanded <= 8); assert.ok(work.navigation <= 128);
    assert.ok(work.immediate <= 40, 'at most one small urgent/recovery request per enemy');
  }
  assert.equal(moved.size, 20); assert.ok(maxPending <= 20);
  roster.forEach(f => f.brain.dispose()); assert.equal(scheduler.snapshot().pending, 0);
});

test('deferred alternate attacks cannot commit before fresh adjacent-player priority is evaluated', () => {
  const scheduler = createPlanningScheduler();
  const sheep = { id: 'sheep', character: 'sheep', isAlive: true, cell: { x: 1, y: 2 }, position: { x: 96, y: 160 } };
  const f = fixture(goblinProfile, { scheduler, getWorld: () => ({ characters: [sheep], bushes: [] }) });
  const player = f.player; f.player = null; f.tick();
  f.player = player; scheduler.beginFrame();
  assert.equal(f.attacks.length, 0, 'scheduler only computes, never commits');
  f.tick(); assert.equal(f.attacks.length, 1);
  assert.deepEqual(f.attacks[0].args[0], { x: 1, y: 0 }); f.brain.dispose();
});
