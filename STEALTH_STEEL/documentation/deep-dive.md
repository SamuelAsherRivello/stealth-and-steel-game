<!-- AI: This shared diagram is stored only at BIS/documentation/bitcoin-ark-arkade-bis-game.png in the BIS repository. If it is updated, update and store it only there; both Deep Dive pages must keep linking to this single source. -->
![Bitcoin Layer 1, ARK, Arkade, BIS, and Game](https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/bitcoin-ark-arkade-bis-game.png)

### Legend

1. [Bitcoin](https://bitcoin.org/en/) (Layer 1) — The decentralized base layer that provides final settlement and security.
2. [Ark](https://ark-protocol.org/) (Layer 2) — An off-chain Bitcoin transaction-batching protocol for fast, low-cost payments with self-custodied exits to Layer 1.
3. [Arkade](https://arkadeos.com/) (Layer 2) — A programmable Bitcoin execution layer for wallets, payments, assets, and contracts.
4. [BIS](https://github.com/SamuelAsherRivello/blockchain-integration-service) (Integration) — A custom TypeScript/React library that connects Arkade workflows to a game through a small, game-neutral contract.
5. [Game](https://github.com/SamuelAsherRivello/stealth-and-steel-game) (Application) — The custom Stealth & Steel host game, which owns scenes and gameplay consequences after BIS confirms an outcome.

# Deep Dive

This document reviews the inner workings of the project.

This project has 2 repos:

1. [BIS Library](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/deep-dive.md): Reusable Typescript/React Library. Signet wallet and blockchain workflow integration.
2. Stealth & Steel Game: Typescript example stealth-action game consuming the BIS

---

## Stealth & Steel Game

This repository owns Babylon scenes, player state, pause/focus/fullscreen behavior, and game consequences after a confirmed result. Read the BIS Deep Dive from the first list above beside this document to see both sides of the contract.

### Shared showcase: `BisHostGame`

The published [`BisHostGame`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/core/bis-host-game.ts) interface is the complete handoff from BIS to a game. It does not expose Arkade types and it does not let BIS inspect game scenes. Its clear names define the sequence: find a current session, capture a continuation target, apply a confirmed continuation, or present a confirmed player reward.

```ts
type BisHostGameEffectReceipt = { status: 'applied' | 'already-applied' | 'not-applicable' };
```

The receipt is deliberately only about the game effect. A `not-applicable` result for an old/reloaded session leaves the current run unchanged; it cannot retry or reverse a confirmed payment or mint.

### Game-specific showcase: `createBisHostGame`

[`createBisHostGame`](../src/runtime/integration/bis-host-game.js) implements the published contract in the game’s integration folder. It has three important jobs:

1. It obtains the active `{ gameId, gameSessionId }` without leaking scene objects to BIS.
2. It permits a continuation target only for the current defeat state.
3. It keeps a per-session operation ledger, so a replay returns `already-applied` and a previous run returns `not-applicable`.

```js
const host = createBisHostGame({
  gameId: 'stealth-and-steel',
  getActiveGameSessionId,
  canCaptureContinuation: () => gameStateMachine.state === GameState.LEVEL_LOST,
  applyContinuation: revivePaidPlayer,
  presentPlayerReward: showGameOwnedReward,
});
```

The adapter calls the existing paid-revival function, preserving the current player replacement, local enemy cleanup, and pause resume behavior. It does not make the game depend on a BIS account: regular play proceeds when the package, account, or connection is unavailable.
