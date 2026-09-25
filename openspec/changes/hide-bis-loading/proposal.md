# Proposal

## Why

Level completion currently creates and refreshes the BIS trophy-ownership
controller only after the player reaches the exit. That network-dependent work
can delay the completion menu's final trophy state even though the relevant
trophy is known when the game session begins.

## What Changes

- Begin the configured level trophy's ownership check asynchronously when a
  playable game session starts.
- Retain the prefetched controller and its latest ownership state for the
  session's eventual completion screen.
- Keep level completion responsive while a prefetch is pending, unavailable,
  or fails, preserving the existing manual ownership-check recovery path.
- Dispose prefetched resources on session replacement or shutdown, and never
  let a stale result update a newer session.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tiny-swords-ui-theme`: Define session-start trophy-ownership prefetching and
  completion-menu behavior that consumes its current result without waiting for
  a fresh initial check.

## Impact

The change affects the runtime level-reward lifecycle, game-session startup and
disposal wiring, the level-completion trophy UI state, and focused lifecycle
and UI tests. It uses the existing public BIS asset-collection controller and
does not change wallet actions, trophy identities, or collection semantics.
