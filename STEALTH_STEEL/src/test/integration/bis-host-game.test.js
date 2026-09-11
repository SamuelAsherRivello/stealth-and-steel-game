import test from 'node:test';
import assert from 'node:assert/strict';
import {createBisHostGame} from '../../runtime/integration/bis-host-game.js';

test('host applies matching continuation once and rejects replayed or stale delivery', async () => {
  let session = 'run-one', revives = 0;
  const host = createBisHostGame({gameId:'stealth-and-steel',getActiveGameSessionId:()=>session,canCaptureContinuation:()=>true,applyContinuation:()=>++revives === 1});
  const reference = host.getActiveGameSessionReference();
  const target = host.captureContinuationTarget({gameSessionReference:reference});
  const command = {operationId:'continue-1',gameSessionReference:reference,continuationTarget:target};
  assert.deepEqual(await host.applyConfirmedContinuation(command),{status:'applied'});
  assert.deepEqual(await host.applyConfirmedContinuation(command),{status:'already-applied'});
  session = 'run-two';
  assert.deepEqual(await host.applyConfirmedContinuation(command),{status:'not-applicable'});
  assert.equal(revives,1);
});

test('host keeps reward presentation game-owned and session-scoped', async () => {
  let session = 'run-one', presentations = 0;
  const host = createBisHostGame({gameId:'stealth-and-steel',getActiveGameSessionId:()=>session,applyContinuation:()=>false,presentPlayerReward:()=>{presentations++;return true;}});
  const reference = host.getActiveGameSessionReference();
  const reward = {operationId:'reward-1',gameSessionReference:reference,rewardId:'LVL1',rewardDisplayName:'Achievement: Level 1'};
  assert.deepEqual(await host.presentConfirmedPlayerReward(reward),{status:'applied'});
  assert.deepEqual(await host.presentConfirmedPlayerReward(reward),{status:'already-applied'});
  session = undefined;
  assert.deepEqual(await host.presentConfirmedPlayerReward({...reward,operationId:'reward-2'}),{status:'not-applicable'});
  assert.equal(presentations,1);
});
