# Tasks

## 1. Stable Items loading and shared body copy

- [ ] 1.1 `C086-T001` Initialize the Items dialog with the exact `Loading ...` body text and its final ready-state footprint before the equipment provider begins; verify focused UI coverage observes the pending text and unchanged dialog height before and after resolution.
- [ ] 1.2 `C086-T002` Replace the local Items status treatment with the shared Tiny Swords body-text styling for both loading and the restored ready instruction; verify focused UI/style assertions confirm the exact ready copy and shared color/typography path.

## 2. Compact four-card presentation

- [ ] 2.1 `C086-T003` Replace the count-derived Items card topology with the fixed two-by-two compact square-card presentation, using exact 2px row and column gaps and quarter-area cards; verify focused style/UI tests assert the topology, gutters, visible metadata, and no scrollbar.
- [ ] 2.2 `C086-T004` Add the temporary four-copy Shoes I visual-preview state with unique preview identities that cannot enter the real provider state or change equipment selection; verify focused tests prove four visible Shoes cards and preserve normal real-item select/clear behavior.

## 3. Regression and visual acceptance

- [ ] 3.1 `C086-T005` Run the focused Items UI tests and the production build; verify both complete successfully without modifying existing wallet capability, focus-return, close, or HUD behavior.
- [ ] 3.2 `C086-T006` Manually inspect a muted browser session at the configured game base URL with `?muteMusic=true&muteSFX=true`; verify Items first shows `Loading ...` at the final height, then the shared-style instruction and complete 2-by-2 Shoes preview inside the game frame.
