# Proposal

## Why

The game currently has no consistent way to explain menu controls, leaving the Items action unclear and providing no guidance when wallet support is unavailable. A reusable tooltip foundation is needed now so the first tooltip can be added without creating a one-off UI pattern for future controls.

## What Changes

- Add a game-wide tooltip capability for interactive UI controls.
- Show tooltips on pointer hover and keyboard focus.
- Position tooltips adaptively within the visible game frame and keep their full text readable.
- Add the first tooltip to the main-menu Items button with state-dependent copy.
- Keep future tooltip targets out of scope for this change.

## Capabilities

### New Capabilities

- `game-tooltips`: Reusable, accessible, game-frame-contained tooltips for game UI controls.

### Modified Capabilities

- `item-equipment-selection`: Add explanatory tooltip behavior to the existing main-menu Items entry point without changing its support gating or item flow.

## Impact

The shared menu/UI presentation layer and its styles will gain tooltip support, and the Start Menu Items button will consume it. Existing item capability detection, button visibility, disabled behavior, and Items dialog behavior remain authoritative. No new dependency or external service is required.
