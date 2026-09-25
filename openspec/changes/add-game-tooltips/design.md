# Design

## Context

The shared menu factory creates native buttons and already participates in game-frame-bound DOM presentation. The Start Menu owns the Items button's capability visibility and enabled state, while `hasItemSupport()` remains the authoritative BIS gate. See `proposal.md` and the delta specs for the required user-visible behavior.

## Goals / Non-Goals

**Goals:**

- Add a small reusable tooltip controller that can serve future game UI controls.
- Use pointer hover and keyboard focus as the activation paths.
- Anchor tooltip geometry to the visible game frame and recalculate after viewport changes.
- Keep disabled Items guidance discoverable without changing the existing Items action gate.
- Reuse the existing Tiny Swords visual language and accessible control semantics.

**Non-Goals:**

- Adding tooltips to other controls in this change.
- Changing Items visibility, wallet capability detection, item loading, or item selection.
- Adding a dependency or a new tooltip interaction model for touch long-press.

## Decisions

### Use a shared DOM tooltip controller

Implement tooltip creation, activation listeners, text updates, positioning, and disposal in the shared UI layer rather than embedding tooltip markup in `start-game-prompt.js`. This makes later tooltip targets additive and keeps lifecycle ownership explicit. A CSS-only `title` replacement was rejected because native browser placement cannot guarantee containment within the game frame or preserve the requested visual treatment.

### Position against the visible game-frame bounds

The controller will measure the target, tooltip, and game-frame safe bounds, prefer a side with available space, then flip and clamp within the frame. It will refresh on relevant resize/viewport changes and avoid exposing overflow. This follows the existing frame-bound menu and viewport-safe-area contracts instead of positioning against the browser window.

### Keep text as one dynamic message

The Items integration will provide a text resolver or update hook driven by the button's current enabled state. The tooltip will use the exact requested sentence for enabled state and the exact login guidance for disabled state, without adding a title, icon, or extra copy.

### Preserve disabled-control discoverability

Because native disabled buttons cannot receive focus, the integration must attach hover/focus handling through a suitable always-present wrapper or equivalent host while preserving the button's native disabled semantics. The tooltip must not make the disabled button actionable.

## Risks / Trade-offs

- [Risk] A disabled control cannot receive native focus → Mitigation: keep the tooltip trigger outside the disabled button's activation semantics and retain the button's disabled state.
- [Risk] Very narrow frames leave little room for readable copy → Mitigation: clamp to the frame with responsive max width and allow readable wrapping while preserving the full text.
- [Risk] Existing dirty UI work may overlap the integration points → Mitigation: apply only to the shared tooltip/menu files and Start Menu integration, preserving unrelated changes.

## Migration Plan

Add the shared tooltip utility and styles, integrate only the Items button, and verify focused unit/UI behavior plus the running game at representative frame sizes. Rollback is limited to removing the tooltip utility/styles and its Items integration; existing Items behavior remains unchanged.
