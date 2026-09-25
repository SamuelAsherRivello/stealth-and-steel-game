# Tasks

## 1. Shared Tooltip Foundation

- [ ] 1.1 C085-T001 Add the reusable tooltip controller and lifecycle API for pointer hover and keyboard focus, with unit tests verifying activation, text rendering, and disposal.
- [ ] 1.2 C085-T002 Add Tiny Swords tooltip styling and adaptive frame-contained positioning, with layout tests covering edge clamping, flipping, wrapping, and viewport resize behavior.

## 2. Items Button Integration

- [ ] 2.1 C085-T003 Integrate the shared tooltip with the Start Menu Items entry point while preserving existing visibility, disabled, and click-gating behavior; verify exact enabled and disabled copy in UI tests.
- [ ] 2.2 C085-T004 Make disabled Items guidance discoverable without making the disabled control actionable, then verify keyboard, pointer, and accessibility behavior.

## 3. Runtime Verification

- [ ] 3.1 C085-T005 Run focused tooltip/menu tests and the project build, then manually verify the running game at desktop, narrow portrait, and an Items-disabled state with both tooltip messages fully inside the game frame.
