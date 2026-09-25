# Design

## Context

See `proposal.md` and the `tiny-swords-ui-theme` delta. The current
level-reward flow waits until level completion to create a BIS asset-collection
controller and immediately calls its refresh. That controller supplies both the
ownership result and the collect/check actions, while the completion UI already
allows non-trophy navigation during checking.

## Goals / Non-Goals

**Goals:**

- Move the first ownership refresh into session startup so normal play absorbs
  its latency.
- Keep one controller and one initial ownership request per configured trophy
  for a session.
- Preserve completion visibility, navigation, error handling, and manual
  recovery while a result remains pending or unavailable.
- Make session disposal authoritative over asynchronous updates.

**Non-Goals:**

- Change trophy metadata, eligibility, minting, collection, account login, or
  BIS public APIs.
- Delay gameplay start, level progression, or completion-menu display for a
  wallet result.
- Add caching across browser reloads or sessions.

## Decisions

### Start a session-scoped reward controller after the player starts

The reward lifecycle will expose a session-start prefetch operation invoked only
after the player starts a run, not during initial document load. For a
configured trophy with visible BIS asset-minting support, it creates the same
public asset-collection controller the completion flow currently uses,
subscribes to it, and begins one refresh in the background. This avoids
unnecessary wallet work for an unopened game while preserving an existing
controller contract.

Alternative considered: initiate the check at page load. Rejected because the
user asked for game-start timing and a visitor who never begins a run should
not cause wallet-dependent work.

### Share initialization between prefetch and level completion

The reward flow will retain one initialization promise/controller for its active
session. Completion renders the game-owned menu first, then attaches to the
retained work: a settled result is reflected immediately, and a pending result
continues updating the existing checking state. Completion must not issue a
second initial refresh merely because prefetch is still pending.

Alternative considered: create a second controller at completion if prefetch is
not settled. Rejected because it duplicates remote work and allows competing
state updates.

### Bound async results to reward lifecycle ownership

Each prefetch will be guarded by the active reward lifecycle and disposed with
its session. Completion, restart, advance, and teardown will ignore results
from disposed instances; completion only reflects a controller still owned by
the current reward flow. This uses the existing lifecycle's disposal semantics
rather than persisting result data separately.

Alternative considered: store a global ownership cache. Rejected because a
global cache complicates account changes and stale-result invalidation without
being required to hide per-session latency.

## Risks / Trade-offs

- [A prefetch remains unresolved until completion] → Show the completion menu
  immediately and retain its existing checking, navigation, and manual-retry
  behavior.
- [Session replacement races a resolved promise] → Gate every callback on
  lifecycle ownership and dispose the controller/subscription exactly once.
- [BIS capability or a trophy is absent] → Skip prefetch and preserve the
  current non-trophy completion path.

## Migration Plan

This is a runtime-only behavior change with no stored-data or API migration.
Deploy with focused lifecycle/UI tests, the relevant integration checks, the
full test suite, and a production build. Rollback consists of restoring the
completion-time initialization behavior; no persisted state needs conversion.
