# BIS release package

- Package: `@bis/integration` 0.14.0.
- Release: https://github.com/SamuelAsherRivello/blockchain-integration-service/releases/tag/v0.14.0
- Source commit: `e68f356b553d49c90d7888ebb9cd6a262d9a6ad3`.
- Downloaded release archive: `bis-integration-0.14.0.tgz`.
- Vendored filename: `bis-integration-0.14.0-31b999e50909.tgz`.
- SHA-256: `31b999e509092f9dda274c62aa8bcc0d4eb5f3a69b34a7bd6242f80285b560ba` (verified against the published SHA256SUMS).
- Exact 70-file inventory: [bis-package-inventory.json](bis-package-inventory.json).
- React and React DOM: 19.2.8.

This release adds the paid-continuation, trophy-collection, and queued toast APIs used by the game. BIS mounts at native 100%; the game owns restart after confirmed logout.

Run `node STEALTH_STEEL/tools/verify-bis-package.mjs` from the game root after installation.
See the [coordinating runbook](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/SMOKE_TEST_BIS_TO_GAME.md)
for setup and remaining live/device acceptance.

F1 local development snapshot: bis-integration-0.14.1-f1-c70c2adcabe1.tgz. SHA-256: c70c2adcabe1fdceadaf34a8a6a15478e70db9051b6c14d12795503b085e5e1a. Includes independent Admin wallet API and public Continue recipient configuration; live payment verification pending.

F1 host configuration: set public VITE_BIS_GAME_WALLET_ADDRESS before building. BIS disables new Continue payments when it is absent or invalid. The value is the game's Arkade receiving address, not a signing credential. Admin can be closed during receipt. No actual recipient has been selected in this checkout by this change.

Final F1 snapshot: bis-integration-0.14.1-f1-c70c2adcabe1.tgz. SHA-256: c70c2adcabe1fdceadaf34a8a6a15478e70db9051b6c14d12795503b085e5e1a. Supersedes the earlier local F1 snapshot above.
