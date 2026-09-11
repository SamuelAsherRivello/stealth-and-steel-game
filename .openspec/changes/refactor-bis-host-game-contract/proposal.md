## Why

Stealth and Steel currently receives confirmed BIS continuation results through local callback closures. That preserves gameplay behavior, but it does not give either repository a named, reviewable contract for the game-owned effects that follow a verified BIS operation. C074 establishes that contract and the documentation trail needed to understand the two repositories together.

## What Changes

- **BREAKING:** Migrate the game to the next major BIS public API, whose required `BisHostGame` interface names the complete game-side contract: active-session reference, continuation-target capture, confirmed-continuation application, and confirmed-player-reward presentation.
- Implement game-owned `createBisHostGame` as the concrete Stealth and Steel adapter; keep all Babylon, pause, checkpoint/revival, UI, and reward-presentation decisions in the game.
- Use stable operation and session identifiers plus typed, session-scoped idempotent receipts. A confirmed BIS financial outcome is never retried or reversed because a game effect is unavailable.
- Add TypeScript as development-only game contract tooling: JSDoc annotations, a focused type check, and runtime contract tests, while retaining JavaScript runtime source.
- Add a game `Deep Dive` README section and a long-form, cross-linked Deep Dive document. The document features `BisHostGame` and `createBisHostGame`, links to the BIS Deep Dive, and contains source links and focused snippets.
- Add game Code Templates for runtime controllers, DOM/UI modules, and Node tests, then use them for files migrated by this change.

## Capabilities

### New Capabilities

- `bis-host-game-contract`: The game fulfills the published BIS host contract for verified continuation and reward delivery without coupling gameplay to BIS internals or Arkade.

### Modified Capabilities

None. The externally observable player-loss and reward behavior remains unchanged; C074 replaces its integration seam, not its gameplay semantics.

## Impact

- `STEALTH_STEEL/src/runtime/integration/`, `runtime/main.js`, paid-continuation/reward composition, and focused UI/integration tests.
- Root development tooling and package scripts for type-only contract verification; no production runtime dependency changes beyond the next major `@bis/integration` package artifact.
- Root README and `STEALTH_STEEL/documentation/`, including the game Deep Dive and Code Templates.
- Coordination with BIS's linked refactor plan: the library exports `BisHostGame` and `BisGameServices`; the game consumes only those public exports.
