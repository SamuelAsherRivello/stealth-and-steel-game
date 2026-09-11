# DOM UI module

## Purpose

Render one game-owned overlay or HUD and translate explicit user input into controller actions.

## Allowed dependencies

- DOM primitives, one controller interface, and existing UI helpers.
- No wallet SDK, persistence, or direct BIS internal import.

## Template

```js
export function createFeatureUi({ host, controller }) {
  const root = document.createElement('section');
  const unsubscribe = controller.subscribe?.(() => render(controller.getState()));
  function render(state) { /* reflect state; do not invent financial status */ }
  host.append(root); render(controller.getState?.() ?? {});
  return { show: () => { root.hidden = false; }, hide: () => { root.hidden = true; }, dispose() { unsubscribe?.(); root.remove(); } };
}
```

## State, errors, and disposal

The controller owns business state; the UI owns DOM nodes, focus, and event listeners. A dismissed UI must not cancel a submitted operation. Error copy must be safe and actionable.

## Verification

Use the project’s lightweight DOM fixture pattern and run its matching `node --test` file.
