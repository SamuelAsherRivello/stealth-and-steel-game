# Design

## Context

See `proposal.md` and the `item-equipment-selection` delta. The current Items
renderer mounts an empty status and grid, then waits for both the provider and
refresh before its first render. Its grid derives a topology from inventory
count, while its instruction has a local color/font override instead of the
shared Tiny Swords body-text treatment.

## Goals / Non-Goals

**Goals:**

- Make the pending and ready states share one stable dialog footprint.
- Make the requested four-card visual approval state deterministic.
- Preserve the provider, refresh, selection, clearing, focus, close, and BIS
  capability contracts.

**Non-Goals:**

- Change wallet access, item metadata, pricing, selection APIs, or HUD behavior.
- Add backend prefetching, cache inventory across sessions, or change trophy
  ownership loading covered by C082.
- Treat duplicate preview copies as separate real assets or equipment slots.

## Decisions

### Render the pending state before starting asynchronous inventory work

The Items view will initialize its status to `Loading ...` and set the content
container/grid dimensions before invoking the provider. Ready, unavailable,
and failure paths will replace that pending state rather than mounting content
for the first time after the request.

Alternative considered: reserve height with a blank container. Rejected because
it retains the confusing empty dialog that prompted this change.

### Use one fixed two-by-two card footprint

The UI will make two columns and two rows the compact visual topology, with a
2px CSS grid gap. Card dimensions will be half the former single-card width and
height, yielding one-quarter area per card while leaving enough panel room for
the instruction and frame.

Alternative considered: continue adapting layout to every owned-item count.
Rejected because the requested approval target is a predictable four-shoe
layout, not a variable-size board.

### Keep the four-Shoes view isolated from real equipment identity

The temporary preview will reuse Shoes I visual/content data only for the
requested layout check. Its DOM/test identity will be unique per copy, and it
will not fabricate four selectable BIS assets, change selected equipment, or
write duplicate assets through the provider.

Alternative considered: duplicate the asset in the real inventory state.
Rejected because repeated asset IDs would make selection and ownership behavior
ambiguous.

### Reuse the shared body-text class instead of copying colors

The ready instruction and loading status will use the Tiny Swords shared body
text styling. This keeps body copy consistent with the other windows and avoids
another local palette value.

Alternative considered: change the local status color to a sampled equivalent.
Rejected because it would drift from the shared UI contract.

## Risks / Trade-offs

- [The temporary preview is mistaken for owned inventory] -> Clearly constrain
  it to visual QA and prevent it from entering provider state or selection calls.
- [A four-card fixed footprint cannot accommodate larger future inventories] ->
  Treat larger-inventory behavior as a future scoped change rather than silently
  reintroducing the prior variable topology.
- [Async failure leaves ambiguous copy] -> Reuse the current unavailable/failure
  rendering path after the visible pending state.

## Migration Plan

This is a runtime-only presentation change with no stored-data migration.
Implement the renderer and CSS together, update focused Items UI tests, run the
relevant test and production build commands, then visually inspect the pending
and four-card ready states in a muted browser URL. Rollback restores the former
responsive inventory topology and delayed initial render; no data conversion is
needed.
