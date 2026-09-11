## Context

See [proposal.md](proposal.md) for motivation and the new capability spec for externally observable contract behavior. Today the game dynamically imports only `@bis/integration` in `runtime/integration/bis-account.js`. Paid continuation creates a locally scoped callback in `pay-to-continue.js`; on success, `main.js` invokes `revivePaidPlayer`, which replaces the defeated player at its current cell, clears nearby enemies, transitions to playing, and releases only the loss pause. Level trophies and the 90-second treasure flow are game-initiated flows with their own controllers.

This is a coordinated major BIS API change. The library owns the exported contract and the game implements it, but the two repositories retain separate source, OpenSpec, tests, releases, and runtime responsibilities.

## Goals / Non-Goals

**Goals:**

- Give both repositories one readable, explicit inverse-dependency contract for verified BIS-to-game effects.
- Keep the contract precise enough for TypeScript tooling while letting this JavaScript game choose its Babylon implementation.
- Make every effect delivery safe under replay, restart, teardown, account absence, and late async completion.
- Give reviewers a bidirectional documentation path between the library's contract/composition and this game's concrete adapter.

**Non-Goals:**

- Creating a durable checkpoint or generalized game-save feature. The current continuation target represents the existing in-place paid revival.
- Moving pause, player replacement, enemies, Tiled levels, reward art, or gameplay rules into BIS.
- Adding Arkade, a server, or a blockchain-specific dependency to game source.
- Converting the game runtime to TypeScript; TypeScript is development-only contract tooling.

## Decisions

### 1. Publish one complete, intentionally named `BisHostGame` interface

The BIS major release exports one host-side interface and its closely named values. Query methods remain synchronous and command methods return a typed asynchronous receipt. This is a deliberate query/command distinction, not inconsistent style.

```ts
export interface BisHostGame {
  getActiveGameSessionReference(): BisHostGameSessionReference | undefined;
  captureContinuationTarget(input: Readonly<{
    gameSessionReference: BisHostGameSessionReference;
  }>): BisHostGameContinuationTarget | undefined;
  applyConfirmedContinuation(
    input: BisHostGameConfirmedContinuation,
  ): Promise<BisHostGameEffectReceipt>;
  presentConfirmedPlayerReward(
    input: BisHostGameConfirmedPlayerReward,
  ): Promise<BisHostGameEffectReceipt>;
}
```

The associated names remain deliberately explicit: `BisHostGameSessionReference`, `BisHostGameContinuationTarget`, `BisHostGameConfirmedContinuation`, `BisHostGameConfirmedPlayerReward`, and `BisHostGameEffectReceipt`. Session reference contains `gameId` and `gameSessionId`; continuation target contains a game-defined `continuationTargetId`; confirmed inputs include a stable `operationId`; and receipt status is exactly `applied`, `already-applied`, or `not-applicable`.

This is preferred over a generic event bus because each method states its actor, timing, and authority. It is also preferred over a continuation-only interface because the user requested the complete current contract in one showcase file. It is not a game-engine API: there is no `pauseGame`, `setState`, `spawn`, or arbitrary UI command.

### 2. Game owns a concrete `createBisHostGame` adapter

Create `runtime/integration/bis-host-game.js` as the game showcase file. Its factory receives narrowly typed game-owned operations: current run/session identity, current loss target, paid revival, reward feedback, and a session-scoped delivery ledger. It returns the complete contract through JSDoc `@returns {import('@bis/integration').BisHostGame}`.

`main.js` becomes its composition caller, not the host implementation. `pay-to-continue.js` stops owning an opaque BIS success closure and requests delivery through the adapter. The adapter calls existing game behavior such as `revivePaidPlayer`; it does not duplicate that behavior. Current player-loss semantics, including a stale callback after a run ends, remain intact.

### 3. Session-scoped typed receipts separate money truth from game effects

The host stores delivery results only for the active game session. `operationId` identifies a confirmed BIS result; `{gameId, gameSessionId}` identifies the intended game run. First application returns `applied`; replay returns `already-applied`; a stale/ended/missing target returns `not-applicable`.

BIS retains financial truth independently. The adapter must never request payment, minting, rollback, or retry. If the host cannot apply an effect, it yields `not-applicable`; BIS may surface delivery status for diagnosis, but it must not execute the financial operation again.

### 4. Type-check JavaScript at the integration boundary only

Add TypeScript as a dev dependency aligned with BIS's supported type tooling. Add a narrow game TypeScript configuration that enables `allowJs` and checks the adapter via JSDoc without forcing the rest of the runtime through a conversion. Add a root script such as `npm run typecheck:bis-contract`, and retain Node runtime tests because TypeScript cannot validate lifecycle behavior.

This is preferred over JSDoc alone because it catches drift after the next BIS major artifact is installed. It is preferred over converting all integration/game files to `.ts` because C074's risk is the public boundary, not the language of gameplay code.

### 5. Deep Dive documents teach the boundary in both directions

Each repository README gains a `## Deep Dive` section with one neutral sentence: “Deep Dive takes a closer look at a few representative files and the cross-repository contract that connects them.” It links to its repository's long-form document.

The game document is `STEALTH_STEEL/documentation/deep-dive.md`. It first explains that BIS is a second repository, then features the external `BisHostGame` source, the local `createBisHostGame` source, and focused snippets showing session capture, idempotent continuation delivery, and typed receipt handling. It links to the BIS Deep Dive using its published repository URL. The BIS document reciprocally links to this game document and features `BisHostGame` plus `BisGameServices`. Both documents are intentionally detailed in their first version; later editing may shorten them without changing source contracts.

### 6. Templates are project-specific but conceptually aligned

Create `STEALTH_STEEL/documentation/Code Templates/` with runtime-controller, DOM-UI, and Node-test templates. Each names purpose, allowed dependencies, public contract, mutable state, timers/cancellation, disposal, failure policy, and verification. Their structure mirrors the BIS templates without imposing React/TypeScript conventions on ordinary game modules.

## Risks / Trade-offs

- [BIS major artifact and game adapter land out of order] → stage the BIS package first, test the game against its packed artifact, and retain no compatibility shim in this breaking-major plan.
- [A replay revives the wrong run] → require both operation and session identities; return `not-applicable` on stale sessions and prove it with tests.
- [A host exception masks a confirmed financial outcome] → translate expected game inability into a typed receipt, catch unexpected adapter errors at the BIS delivery boundary, and retain operation truth separately.
- [Type checking spreads into unrelated JavaScript] → keep the configuration and JSDoc scope restricted to the adapter and explicit contract fixture.
- [Deep Dive becomes stale marketing copy] → source links, snippets, and cross-links are verification targets; update them in the same change as contract changes.

## Migration Plan

1. Finish the linked BIS proposal updates and package the new major public types/class before changing the game dependency.
2. Add game TypeScript development tooling, contract fixtures, and `createBisHostGame` tests while keeping current callbacks in place for characterization.
3. Add the adapter and migrate continuation/reward composition one flow at a time; compare all loss-flow behavior against existing tests.
4. Replace the vendored BIS artifact only after the packed contract check passes, then remove the superseded callback seam in the same reviewed batch.
5. Add the Deep Dive and templates, run full game and cross-repository checks, and review documentation from both repository entry points.

Rollback is release- and commit-granular: keep the previous game package artifact until the new adapter's type and runtime checks pass, then revert the game dependency/update together if the major contract cannot be adopted safely. No game save or wallet record migration is involved.
