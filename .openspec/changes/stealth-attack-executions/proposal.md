## Why

Enemies currently communicate only forward-looking perception and ordinary melee risk. C073 adds a short-lived, readable rear-position opportunity that rewards observing a stationary enemy and gives the player a deliberate, cinematic takedown without adding a new control or art asset.

## What Changes

- Add C073's stealth-attack execution capability: every stable living enemy exposes a yellow rear-cell opportunity after more than 0.25 seconds without turning or moving.
- Fade the yellow opportunity in and out over 0.125 seconds while keeping its gameplay validity strict: turning or movement cancels it immediately, even during fade-out.
- Pull an entering player to the opportunity with the established bush-gravity timing, resolve overlapping opportunities by stable enemy record order, and retain an opportunity marker even when terrain or another actor makes its cell unreachable.
- Replace an armed ordinary knife swing with a target-only, choreographed execution using existing knife frames. The player stays logically in the rear cell, is movement-locked and invulnerable for 0.8 seconds, and the target immediately receives a stronger-knockback three-spin death.
- Suppress the ordinary knife midpoint and its area damage for an execution; all unarmed attacks retain their current knife behavior.

## Capabilities

### New Capabilities

- `stealth-attack-executions`: Define enemy rear-cell opportunity lifecycle, player entry and execution rules, presentation, cancellation, and deterministic target selection.

### Modified Capabilities

- `player-melee-combat`: Allow an armed rear-cell attack to replace the normal knife swing and midpoint damage lifecycle.
- `combat-health-system`: Define the lethal execution damage, extended death presentation, and temporary player invulnerability.

## Impact

- Affected runtime areas: enemy position/heading snapshots, yellow tile-shadow rendering, player movement/input and animation state, knife attack routing, combat state, and game-loop hit handling.
- Affected tests: stealth opportunity timing/fade/cancellation, gravity interaction, melee routing, combat death and invulnerability, renderer lifecycle, deterministic overlap selection, and browser gameplay coverage.
- No new dependency, player-facing control, sprite-art asset, grid/collider-shape change, or persistent save-state change is introduced.
