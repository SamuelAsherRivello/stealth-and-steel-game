<!-- AI: These shared diagrams are stored only in BIS/documentation in the BIS repository. If they are updated, store them only there; both Deep Dive pages must keep linking to these single sources. -->
![BIS concept diagram](https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/bis-concept-diagram-1.png)

### Legend

1. [Bitcoin](https://bitcoin.org/en/) (Layer 1) — The decentralized base layer that provides final settlement and security.
2. [Ark](https://ark-protocol.org/) (Layer 2) — An off-chain Bitcoin transaction-batching protocol for fast, low-cost payments with self-custodied exits to Layer 1.
3. [Arkade](https://arkadeos.com/) (Layer 2) — A programmable Bitcoin execution layer for wallets, payments, assets, and contracts.
4. [BIS](https://github.com/SamuelAsherRivello/blockchain-integration-service) (Integration) — A custom TypeScript/React library that connects Arkade workflows to a game through a small, game-neutral contract.
5. [Game](https://github.com/SamuelAsherRivello/stealth-and-steel-game) (Application) — The custom Stealth & Steel host game, which owns scenes and gameplay consequences after BIS confirms an outcome.

![BIS sequence diagram](https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/bis-sequence-diagram-1.png)

# Deep Dive

This document reviews the inner workings of the project.

This project spans 2 repos:

1. [BIS Library](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/deep-dive.md): Reusable TypeScript/React library with Signet and Mutinynet wallet and blockchain workflow integration.
2. [Stealth & Steel Game](https://github.com/SamuelAsherRivello/stealth-and-steel-game/blob/main/stealth-steel/documentation/deep-dive.md): TypeScript example stealth-action game consuming BIS.

---

## Stealth & Steel Game

This repository owns Babylon scenes, player state, pause/focus/fullscreen behavior, and game consequences after a confirmed result. Read the BIS Deep Dive from the first list above beside this document to see both sides of the contract.

### The shared showcase: `BisHostGame`

The published [`BisHostGame`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/state-layer-core/bis-host-game.ts) interface is the protocol-neutral handoff from BIS to a game. It does not expose Arkade types or let BIS inspect game scenes. Its four methods identify the active session, capture an opaque continuation target, apply a confirmed continuation, and present a confirmed reward.

```ts
interface BisHostGame {
  getActiveGameSessionReference(): BisHostGameSessionReference | undefined;
  captureContinuationTarget(input: { gameSessionReference: BisHostGameSessionReference }): BisHostGameContinuationTarget | undefined;
  applyConfirmedContinuation(input: BisHostGameConfirmedContinuation): Promise<BisHostGameEffectReceipt>;
  presentConfirmedPlayerReward(input: BisHostGameConfirmedPlayerReward): Promise<BisHostGameEffectReceipt>;
}
```

The session reference carries `gameId` and `gameSessionId`. The continuation target is opaque to BIS. The game returns `applied`, `already-applied`, or `not-applicable`; these are effect receipts, not financial statuses. A stale session therefore cannot revive a new run, and an inapplicable delivery cannot charge, reverse, mint, or retry a confirmed BIS operation.

### BIS-specific showcase: `BisGameServices`

[`BisGameServices`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/state-layer-core/bis-game-services.ts) is the package facade that owns BIS lifecycle composition. It assembles the context, game wallet, LTO, and UI boundary; waits for account hydration; delivers confirmed results to the host; and disposes its owned resources in reverse order.

```ts
const services = new BisGameServices({ getGameHost });
await services.ready();
services.mount(container);
const controller = services.createContinue({ onEffectReceipt });
```

### Game-specific showcase: `createBisHostGame`

[`createBisHostGame`](../src/runtime/integration/bis-host-game.js) is the game-owned implementation of the published contract. It obtains the active session without exposing scene objects, permits a continuation target only for the current defeat state, and keeps a per-session operation ledger so replays return `already-applied` while old sessions return `not-applicable`.

```js
const host = createBisHostGame({
  gameId: 'stealth-and-steel',
  getActiveGameSessionId,
  canCaptureContinuation: () => gameStateMachine.state === GameState.LEVEL_LOST,
  applyContinuation: revivePaidPlayer,
  presentPlayerReward: showGameOwnedReward,
});
```

The adapter calls the existing paid-revival function, preserving player replacement, local enemy cleanup, and pause-resume behavior. It does not make the game depend on a BIS account: regular play proceeds when the package, account, or connection is unavailable.
