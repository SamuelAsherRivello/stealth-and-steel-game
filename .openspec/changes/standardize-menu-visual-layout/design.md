## Context

See proposal.md - Why. `menu.js` owns the shared composition, `game-window.js` supplies the closable header, and `tiny-swords-menu.css` currently owns most shared menu spacing. The existing document uses one CSS rule for normal prompt text but Treasure's paragraphs do not receive the same explicit class. Existing tests already inspect the shared CSS and menu structure.

## Goals / Non-Goals

**Goals:**

- Make the reviewed measurements explicit, shared rules across every menu instance.
- Keep title fitting and close-control placement responsive inside the game frame.
- Retain control-specific styles and existing actions while removing toast-only bolt art.

**Non-Goals:**

- Change menu copy, gameplay state, payment behavior, persistence, or the existing lightning treatment on non-toast action buttons.
- Redesign slider, toggle, or Map-order sub-button controls.

## Decisions

### One composition anchor, selected by first visible element

Define a shared toast-bottom custom property and use it to place the composition's first visible element. The logo is the anchor for Start Menu; the ribbon is the anchor when a logo is absent. This preserves the reviewed visual hierarchy without a phantom logo spacer. Anchoring each screen independently was rejected because it would allow the same vertical drift to recur.

### One semantic body-text hook for prompt prose

Ensure ordinary prompt paragraphs explicitly carry the same body-text hook, including Treasure messages. Continue to target slider/toggle labels through their existing control hooks. A broad paragraph selector alone was rejected because it makes custom menu content coincidentally, rather than intentionally, consistent.

### Shared layout tokens separate regular actions from sub-buttons

Represent the 30-percent regular action gap and 53px final-action bottom padding as shared menu layout values. Apply them only to the common action stack; keep map-order controls under their existing sub-button layout. Per-menu margin overrides were rejected because they defeat the consistency requirement.

### Measure the close X from its own rendered geometry

Keep the close button's accessible hit target in the header grid and position the artwork relative to that target by the rendered X width. This avoids viewport-pixel offsets that shift unpredictably when the portrait frame scales. Enlarging or moving the whole button was rejected because it could collide with the title and change the intended hit area.

### Toast-only icon removal through the game-owned integration boundary

Locate the themed toast renderer or its styling boundary in the BIS account integration, and remove the bolt from toast presentation without modifying payment action buttons. Altering the loss payment button or Account action was rejected because the request is limited to toast messaging.

## Risks / Trade-offs

- [External BIS toast markup may not expose a direct icon hook] -> Use the documented integration/style boundary; if a package change is required, preserve the existing toast mount and message delivery contract.
- [Longer titles at doubled size may still have too little room near the close control] -> Calculate available title width after reserving the close hit target, then shrink the title before overlap occurs.
- [A fixed 53px bottom padding can constrain short viewports] -> Keep the existing scroll behavior and verify narrow portrait and short-height layouts with the final action still reachable.

## Migration Plan

1. Add focused structural/style tests for the shared anchor, prose hook, spacing values, title fitting, toast icon omission, and close control geometry.
2. Apply the shared composition and style changes while preserving public menu and account interfaces.
3. Run the focused UI tests, the project test suite/build, and visually inspect start, settings/developer, treasure, loss, and completion menus at desktop and narrow portrait sizes.
4. Roll back by reverting only C071's shared layout changes; no persisted data or game-state migration is involved.
