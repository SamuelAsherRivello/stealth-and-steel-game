# BIS game package snapshot

- Installed package: `@bis/integration` 0.12.0.
- Artifact: `bis-integration-0.12.0-9f8af4c84099.tgz`.
- SHA-256: `9f8af4c84099b0dad944eb3f2dde5a90698e8fcad3eb9a6ee1b692ffcb712b84`.
- Exact 64-file inventory: [bis-package-inventory.json](bis-package-inventory.json).
- React and React DOM: 19.2.8.
- BIS mounts at native 100%; the game owns restart after confirmed logout.

This is a later local snapshot, **not** the published v0.12.0 release archive
(`1bb8fa852c24d1fd54872448c00097401fb4b93e7db94e56d7e9c50d8dc4854d`).
Its original source commit is not recorded. It contains report pagination and visible-viewport
handling absent from the inspected BIS checkout at `4c5de4e`. Do not claim those source
revisions are equivalent. The coordination record lists the differing files.

From the game root, run `node STEALTH_STEEL/tools/verify-bis-package.mjs` after `npm ci`
to check the archive hash, installed file inventory and public export targets.

See the [coordinating runbook](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/SMOKE_TEST_BIS_TO_GAME.md)
for setup and remaining live/device acceptance.
