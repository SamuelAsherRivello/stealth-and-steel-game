## 1. Opportunity state and yellow-shadow presentation

- [x] `C073-T001` Extend the pure rear-cell opportunity model to track stable position/heading intervals, strict token invalidation, and stable-record-order selection; verify focused tests cover every cardinal direction, exact 0.25-second boundary, movement/turn/death cancellation, and overlapping cells.
- [x] `C073-T002` Add retained yellow tile-shadow render instances that fade in, hold, and fade out over 0.125 active seconds without granting faded instances gameplay validity; verify renderer tests cover pause, removal, blocked rear cells, and simultaneous fade-in/fade-out instances.
- [x] `C073-T003` Wire current enemy snapshots and the shadow lifecycle into the game loop while retaining ordinary forward perception shadows; verify integration tests prove yellow opportunities appear for every living enemy type without changing perception geometry.

## 2. Player rear-cell entry and execution lifecycle

- [x] `C073-T004` Implement independently owned rear-cell gravity using the established bush distance, pull, hold, collision cancellation, and deterministic zone-selection semantics; verify player movement tests cover reachable, blocked, centered, interrupted, and overlapping opportunities.
- [x] `C073-T005` Add a dedicated player execution lifecycle that atomically validates and consumes an armed token, locks gameplay position in the rear cell for 0.8 active seconds, applies a visual-only lunge using existing knife frames, and resets presentation safely on completion or teardown; verify player input/state tests cover no stale lock, no physical lunge, and pause behavior.
- [ ] `C073-T006` Compose the armed execution branch with C072's dagger-combo lifecycle so a valid rear-cell Attack suppresses ordinary/combo midpoint damage and buffers while all unarmed behavior remains governed by its existing or C072 rules; verify player-melee tests cover ordinary attacks, combo compatibility, execution-only targeting, and repeated input.

## 3. Combat death and immunity integration

- [x] `C073-T007` Parameterize combat death for the 0.8-second, three-rotation, stronger-knockback execution profile while preserving all normal 250ms death behavior, health events, collider removal, and cleanup ownership; verify combat tests cover target death, exact duration, three spins, knockback, and normal death regression.
- [x] `C073-T008` Route execution immunity through every player damage entry point, including committed melee and hostile arrows, while continuing required non-damage projectile cleanup; verify gameplay tests prove player health is unchanged only during the 0.8-second execution and damage resumes immediately afterward.

## 4. End-to-end verification

- [x] `C073-T009` Add a browser-visible stealth-execution scenario that demonstrates yellow fade, rear-cell pull, immediate invalidation on turn/movement, deterministic overlapping-zone selection, visual lunge, target execution, and immunity; verify it passes in a real browser at the current Vite URL.
- [x] `C073-T010` Run focused unit and browser tests, the relevant broader suite, `npm.cmd run build`, `npm.cmd run openspec -- validate stealth-attack-executions --strict`, and `git diff --check`; report unrelated concurrent-change failures separately.
