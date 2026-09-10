# G2. LTO Treasure Chest

The game consumes the published BIS 0.14.1 release package recorded in `vendor/bis-package-inventory.json`.

## Setup and current availability

No BIS wallet service is required. Open the game and use the gear → Account. After the player Account UI opens, select Account Details → Balance → Game Wallet Login. Create or restore the separate game wallet there. This F2 setup is local to the current browser origin and is the standalone game’s only game-wallet setup route.

Open http://127.0.0.1:5173/. For first-time setup, click Start, then use the gear → Account to connect the player. The Start overlay covers Settings. Reload after connecting, let wallet readiness finish, then click Start for a fresh Level01 run. Walk two cells upward into the treasure within 90 seconds and choose Claim or Reject. Pending feedback closes the dialog; confirmed feedback is a passive toast during gameplay. The game also exposes Account → Contracts for inspection.

G2 uses the selected local game wallet and sends supported Arkade contract operations directly to the configured Arkade operator. No application wallet endpoint or `VITE_BIS_WALLET_SERVICE_URL` setting is used. Without a selected game wallet, Start remains fully playable and simply creates no G2 offer.

Contract creation is enabled by default in the BIS public factory. Each attempt validates real wallet readiness, provider terms, fees, eligible inputs and contract/session state. A separate funded probe page or acceptance click is not required. Hosts may explicitly use creationEnabled:false to stop new offers while preserving existing-contract recovery. A usable zero-balance player may receive a funded claim; the game needs enough eligible unreserved sats for the 1,000-sat reward and any required asset-preserving change and supported zero-fee terms. An old unresolved offer causes the next session to skip funding rather than queue a late replacement.

## Game behavior

The existing Start click immediately starts the game and a 90-second wall-clock deadline. The game-owned session controller attempts creation once, queries only its exact treasureLTO purpose/session/reference/player/game, and never extends eligibility for pause, funding latency, hidden tabs or continuation. Level progression carries the original deadline; finishing the run, leaving it, or starting another session requests cleanup. A browser closed at expiry resumes local reconciliation on a later open; it does not claim a server cleanup occurred while the game was closed.

Level01 contains one TreasureChestSpawner at Tiled column 4, row 11 (game cell 3,5; runtime center 224,352). In a fresh Level01 run it is two cells above the player. The chest always spawns and uses a nonblocking sensor. Entering opens the game-owned Treasure Chest window and adds only the treasure pause reason. Back resumes play; leave and re-enter the sensor to reopen. Claim or Reject closes after durable action acceptance; BIS pending/confirmed toasts remain passive. Expired offers show disabled Claim/Reject and Back, including after their verified refund.

The authored palette is `public/assets/levels/tiled/tilesets/TreasureChestSpawner.tsj`. Its SVG is editor artwork; the runtime uses the accompanying PNG because Babylon's image upload did not decode the SVG reliably. Reopen the Tiled project/map after changing palette definitions. Actual Tiled editor interaction and physical-device touch acceptance have not yet been performed.

BIS owns the generic financial contract, encrypted recovery journal, reserved inputs, signing, verified receipts, Account → Contracts, and F2 Game Wallet Login. The game owns purpose, deadline, placement, collision, pause, dialog and session transitions. F3 board controls remain Admin-only and are not part of the game UI.

## Verification

BIS package hash/inventory verification and the game production build pass. Real-browser Level01 checks cover the visible chest, collision, guest message, movement pause, Back, overlap debounce, re-entry and a 360×640 viewport. This is browser emulation, not physical-device verification. Full-game live funded claim/refund remains unobserved. Hosted isolated-operator acceptance covers real SDK funding, both browser claim signatures, asset preservation, refunds, unknown-submission recovery and a restart during checkpoint signing. Existing unrelated Level02/collider test failures are recorded in the coordinating BIS OpenSpec verification document.

The BIS Admin G2 demonstration uses the same local controller as Runtime Preview. The actual game retains its collision-driven dialogue.


Historical client acceptance: 17 focused game tests passed for the account host, session persistence/continuation, all treasure states, duplicate/late responses, keyboard/touch isolation, focus, signer setup, sensor placement and runtime artwork. A late Claim result now closes only its originating chest window. The actual game Account UI reports BIS v0.14.1. The current archive is recorded in the inventory and provenance. Tiled headless map/tileset export was attempted but crashed, so editor save/reload remains unverified. No additional human testing handoff is requested.

Runtime acceptance restructuring (2026-09-09): the unconditional live-acceptance disable was removed at the user's request. BIS 54 focused tests and the isolated two-tab browser suite pass. Historical live probes and unobserved extended live scenarios are reported separately from automated acceptance. Current runtime package and its hash are recorded in the vendor inventory; both builds pass.

Asset-carrier fix: funding now supports game outputs that also hold assets. It prefers asset-free inputs and otherwise returns every asset with game-owned change, leaving the contract asset-free. Exact quantities are journaled and verified before confirmation. Failure to prepare now includes a sanitized reason.


Historical hosted-wallet acceptance (2026-09-09) documents the superseded service implementation. The current F2 serverless migration has its own active OpenSpec verification.
