# Proposal

## Why

Items currently opens as an empty dialog until its asynchronous inventory refresh
settles, then expands into its populated layout. The instruction also uses a
one-off text treatment that does not match other Tiny Swords body copy, making
the loading-to-ready transition feel unfinished.

## What Changes

- Open Items at its ready-state height immediately and show the exact loading
  text `Loading ...` while the equipment provider and refresh are pending.
- Restore the standard Tiny Swords body-text color and typography for the
  ready-state instruction, using `You may activate one of each item type to
  empower your gameplay.`.
- Replace the inventory-count-dependent topology with a compact fixed 2-by-2
  square-card grid with 2px gaps in both directions; each card uses one-quarter
  of the current single-card area.
- Add a temporary four-copy Shoes I preview used to visually approve the new
  compact layout without changing real equipment-selection semantics.
- Consume the BIS host loading menu for initial inventory loading and existing
  asynchronous select/clear pauses, after adding and locally releasing its
  missing `isBisVisible()`, `showLoading()`, and `hideLoading()` controls.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `item-equipment-selection`: Defines immediate loading feedback, stable Items
  dialog geometry, the compact two-by-two card layout, and its visual-preview
  acceptance state.

## Impact

The change affects the Items UI renderer, Items-specific styles, focused UI
tests, browser visual QA, the BIS host-loading API, and the game's pinned
vendored BIS package. It preserves wallet capability gating, item details, and
real equipment selection behavior.
