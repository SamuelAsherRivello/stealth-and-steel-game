# Runtime controller

## Purpose

Own one game runtime concern: state, timing, subscription, and cleanup for a named gameplay or integration boundary.

## Allowed dependencies

- Its immediate game systems and explicit public integration facades.
- No Arkade import and no BIS source-path import. Only `runtime/integration/` may load `@bis/integration`.

## Template

```js
export function createFeatureController({ dependency }) {
  let disposed = false;
  let generation = 0;
  const timers = new Set();
  const isCurrent = token => !disposed && token === generation;
  return {
    async start() { const token = ++generation; /* do work; guard every late result with isCurrent(token) */ },
    dispose() { disposed = true; generation++; for (const timer of timers) clearTimeout(timer); timers.clear(); },
  };
}
```

## State, errors, and disposal

Name the owner of mutable state. Treat a stale session as inapplicable rather than trying to repair a new run. Dispose listeners and timers in the reverse order they were acquired. Keep real BIS financial outcomes separate from game effects.

## Verification

Add focused Node tests for success, replay/stale behavior, and disposal, then run `npm test`.
