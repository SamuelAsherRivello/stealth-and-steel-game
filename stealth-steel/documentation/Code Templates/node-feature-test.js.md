# Node feature test

## Purpose

Prove a game contract with deterministic callbacks and no renderer, wallet, or network dependency.

## Template

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('stale delivery does not affect the active run', async () => {
  const fixture = createFixture();
  const oldCommand = fixture.command();
  fixture.startNewRun();
  assert.deepEqual(await fixture.host.applyConfirmedContinuation(oldCommand), {status:'not-applicable'});
});
```

## Verification

Name the behavior, use an explicit fixture, and cover normal, replayed, stale, and disposed paths as relevant. Run `npm test` and any dedicated contract typecheck.
