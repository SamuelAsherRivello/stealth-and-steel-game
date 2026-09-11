/** @typedef {import('@bis/integration').BisHostGame} BisHostGame */
/** @typedef {import('@bis/integration').BisHostGameSessionReference} BisHostGameSessionReference */
/** @typedef {import('@bis/integration').BisHostGameContinuationTarget} BisHostGameContinuationTarget */
/** @typedef {import('@bis/integration').BisHostGameConfirmedContinuation} BisHostGameConfirmedContinuation */
/** @typedef {import('@bis/integration').BisHostGameConfirmedPlayerReward} BisHostGameConfirmedPlayerReward */
/** @typedef {import('@bis/integration').BisHostGameEffectReceipt} BisHostGameEffectReceipt */

const receipt = status => Object.freeze({ status });
const sameSession = (left, right) => left?.gameId === right?.gameId && left?.gameSessionId === right?.gameSessionId;

/**
 * Creates the one game-owned implementation of BIS's public host contract.
 * The callbacks deliberately speak in game decisions, not wallet concepts.
 *
 * @param {{gameId: string, getActiveGameSessionId: () => string | undefined,
 *   canCaptureContinuation?: () => boolean,
 *   applyContinuation: () => boolean | Promise<boolean>,
 *   presentPlayerReward?: (reward: BisHostGameConfirmedPlayerReward) => boolean | Promise<boolean>}} options
 * @returns {BisHostGame}
 */
export function createBisHostGame(options) {
  /** @type {Map<string, Set<string>>} */
  const deliveredOperationIdsBySession = new Map();
  const active = () => {
    const gameSessionId = options.getActiveGameSessionId();
    return gameSessionId ? Object.freeze({ gameId: options.gameId, gameSessionId }) : undefined;
  };
  const delivery = async (input, apply) => {
    const current = active();
    if (!sameSession(current, input.gameSessionReference)) return receipt('not-applicable');
    const delivered = deliveredOperationIdsBySession.get(current.gameSessionId) ?? new Set();
    if (delivered.has(input.operationId)) return receipt('already-applied');
    if (!await apply()) return receipt('not-applicable');
    delivered.add(input.operationId);
    deliveredOperationIdsBySession.set(current.gameSessionId, delivered);
    return receipt('applied');
  };
  return Object.freeze({
    getActiveGameSessionReference() { return active(); },
    captureContinuationTarget({ gameSessionReference }) {
      if (!sameSession(active(), gameSessionReference) || !options.canCaptureContinuation?.()) return undefined;
      return Object.freeze({ continuationTargetId: `continue:${gameSessionReference.gameSessionId}` });
    },
    /** @param {BisHostGameConfirmedContinuation} input @returns {Promise<BisHostGameEffectReceipt>} */
    applyConfirmedContinuation(input) {
      if (input.continuationTarget.continuationTargetId !== `continue:${input.gameSessionReference.gameSessionId}`) return Promise.resolve(receipt('not-applicable'));
      return delivery(input, options.applyContinuation);
    },
    /** @param {BisHostGameConfirmedPlayerReward} input @returns {Promise<BisHostGameEffectReceipt>} */
    presentConfirmedPlayerReward(input) {
      return delivery(input, () => options.presentPlayerReward?.(input) ?? false);
    },
  });
}
