# BIS release package

- Package: `@bis/integration` 0.13.0.
- Release: https://github.com/SamuelAsherRivello/blockchain-integration-service/releases/tag/v0.13.0
- Source commit: `bd21a5223fe666294c864e24ccb1f5306577d306`.
- Downloaded release archive: `bis-integration-0.13.0.tgz`.
- Vendored filename: `bis-integration-0.13.0-3afb5bb2ccd1.tgz`.
- SHA-256: `3afb5bb2ccd1f2242de306ab8359ce93d726f2849e37679aee5374c2623b3736` (verified against the published SHA256SUMS).
- Exact 64-file inventory: [bis-package-inventory.json](bis-package-inventory.json).
- React and React DOM: 19.2.8.

The release reconciles the former local snapshot into BIS source, preserves the rounded
network header during card scrolling, and includes report pagination and visible-viewport
handling. BIS mounts at native 100%; the game owns restart after confirmed logout.

Run `node STEALTH_STEEL/tools/verify-bis-package.mjs` from the game root after installation.
See the [coordinating runbook](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/SMOKE_TEST_BIS_TO_GAME.md)
for setup and remaining live/device acceptance.
