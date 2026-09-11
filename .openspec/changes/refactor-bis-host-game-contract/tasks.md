## 1. Contract adoption baseline

- [ ] `C074-T001` Record characterization tests for the current paid-revival, reward, stale-callback, no-account, restart, and teardown paths; verify the existing player-loss and integration tests establish behavior before the adapter is introduced.
- [ ] `C074-T002` Coordinate the linked BIS major package artifact that exports `BisHostGame`, its explicit associated types, and `BisGameServices`; verify the game consumes a packed public artifact rather than a BIS source path.
- [ ] `C074-T003` Add TypeScript as a development-only dependency, a narrow JavaScript/JSDoc contract configuration, and `typecheck:bis-contract`; verify the command checks only the BIS adapter boundary without requiring a runtime TypeScript conversion.

## 2. Game-owned host adapter

- [ ] `C074-T004` Define game session identity, opaque continuation-target capture, and session-scoped delivery-ledger behavior in focused tests; verify matching, replayed, ended, and replaced sessions produce the required receipt states.
- [ ] `C074-T005` Implement `runtime/integration/bis-host-game.js` as `createBisHostGame` with JSDoc conformance to the complete exported `BisHostGame` interface; verify the typecheck and adapter tests enforce all four required methods and public types.
- [ ] `C074-T006` Route confirmed continuation delivery through `createBisHostGame` while reusing `revivePaidPlayer`; verify one matching delivery revives the existing loss, duplicate delivery does not mutate the scene again, and stale delivery returns `not-applicable`.
- [ ] `C074-T007` Route confirmed player-reward presentation through `createBisHostGame` without moving level, art, UI, or gameplay decisions into BIS; verify applicable, duplicate, and no-active-session reward receipts do not repeat financial work.
- [ ] `C074-T008` Replace the previous local BIS success callback seam only after the adapter paths pass; verify account dialog, pause, focus, fullscreen, restart, game-wallet, treasure, and no-account behavior remain game-owned and unchanged.

## 3. Boundary and composition verification

- [ ] `C074-T009` Reduce `runtime/main.js` to adapter composition inputs rather than inline BIS delivery behavior; verify scene startup still composes one adapter and preserves existing disposal ordering.
- [ ] `C074-T010` Add static and runtime boundary tests that reject Arkade imports and BIS internal imports from game code; verify the adapter uses the public package types and a deliberate invalid fixture produces an actionable failure.
- [ ] `C074-T011` Update the vendored BIS major artifact only after a packed-artifact browser smoke test passes; verify `smoke-bis-release`, focused continuation/reward tests, and the new typecheck resolve the same public contract.

## 4. Deep Dive and code templates

- [ ] `C074-T012` Create `STEALTH_STEEL/documentation/Code Templates/` with detailed runtime-controller, DOM-UI, and Node-test templates; verify each covers purpose, allowed dependencies, state/timers, disposal, error policy, and verification.
- [ ] `C074-T013` Add a `## Deep Dive` section to the game README with the approved one-sentence introduction and a link to the local Deep Dive; verify its placement and link resolve from the repository root.
- [ ] `C074-T014` Author the long-form game Deep Dive with source links and focused snippets for external `BisHostGame` and local `createBisHostGame`, explain the two-repository boundary, and link to the BIS Deep Dive; verify every internal and published cross-repository link resolves.
- [ ] `C074-T015` Review the game and BIS Deep Dives together from both README entry points; verify they use consistent terminology, each identifies its own project-specific showcase, and neither claims that game effects change confirmed BIS financial state.

## 5. Full regression and release readiness

- [ ] `C074-T016` Run `npm test`, `npm run test:publish`, `npm run typecheck:bis-contract`, and `npm run build`, plus focused real-browser continuation, reward, account, and no-account smoke checks; verify C074 scenarios pass and report unrelated dirty-worktree failures separately.
- [ ] `C074-T017` Validate `C074 — refactor-bis-host-game-contract` with strict OpenSpec validation and review the staged game/BIS major release order; verify no implementation is published until both repositories' package and documentation checks pass.
