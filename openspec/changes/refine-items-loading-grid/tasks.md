# Tasks

## 1. BIS host-loading release and import

- [ ] 1.1 `C086-T001` Add public `isBisVisible()`, `showLoading()`, and `hideLoading()` controls to the BIS UI client; verify BIS and host loading ownership remain independent in focused BIS tests.
- [ ] 1.2 `C086-T002` Increment the BIS package version, run its release checks/tests/build, and export a verified local `@bis/integration` tarball with manifest and SHA-256.
- [ ] 1.3 `C086-T003` Import that verified tarball into the game vendor, update lockfile/inventory/provenance, and verify the pinned public API using the package verifier and BIS contract typecheck.

## 2. Stable Items loading and shared body copy

- [ ] 2.1 `C086-T004` Initialize the Items dialog with the exact `Loading ...` body text and its final ready-state footprint before the equipment provider begins; when `isBisVisible()` is false, show the host BIS loading entry until the refresh settles; verify focused UI coverage observes both states.
- [ ] 2.2 `C086-T005` Replace the local Items status treatment with the shared Tiny Swords body-text styling and the exact ready instruction `You may activate one of each item type to empower your gameplay.`; use the same guarded BIS host loading entry for real asynchronous select/clear requests.

## 3. Compact four-card presentation

- [ ] 3.1 `C086-T006` Replace the count-derived Items card topology with the fixed two-by-two compact square-card presentation, using exact 2px row and column gaps and quarter-area cards; verify focused style/UI tests assert the topology, gutters, visible metadata, and no scrollbar.
- [ ] 3.2 `C086-T007` Add the temporary four-copy Shoes I visual-preview state with unique preview identities that cannot enter the real provider state or change equipment selection; verify focused tests prove four visible Shoes cards and preserve normal real-item select/clear behavior.

## 4. Regression and visual acceptance

- [ ] 4.1 `C086-T008` Run focused BIS and Items UI tests plus the production build; verify existing wallet capability, focus-return, close, and HUD behavior remain unchanged.
- [ ] 4.2 `C086-T009` Manually inspect a muted browser session at the configured game base URL with `?muteMusic=true&muteSFX=true`; verify Items first shows `Loading ...` at the final height with BIS loading only while BIS is otherwise hidden, then the shared-style instruction and complete 2-by-2 Shoes preview inside the game frame.
