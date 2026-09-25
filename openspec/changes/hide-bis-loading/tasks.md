# Tasks

## 1. Session-scoped trophy prefetch

- [ ] `C082-T001` 1.1 Extend the level-reward lifecycle to initialize the configured trophy's existing public BIS asset-collection controller and ownership refresh at game-session start, reusing one controller/promise through completion; verify focused level-reward tests prove one initial refresh for a settled prefetch and no duplicate initialization at completion.
- [ ] `C082-T002` 1.2 Wire session start, level advance/restart, and runtime teardown to begin and dispose the reward prefetch at the correct lifecycle boundaries; verify focused lifecycle tests prove an unopened start screen causes no prefetch and a disposed or replaced session cannot update the active completion UI.

## 2. Completion behavior and regression coverage

- [ ] `C082-T003` 2.1 Preserve immediate completion-menu rendering and existing manual recovery while shared ownership is pending, unavailable, or failed; verify UI/integration tests cover pending completion, settled owned/unowned states, capability absence, and non-blocking Continue/Restart Game.
- [ ] `C082-T004` 2.2 Run the focused reward/UI tests, the relevant BIS contract/integration tests, the full test suite, and the production build; verify a browser smoke scenario with `?muteMusic=true&muteSFX=true` shows completion without a second initial ownership request.
