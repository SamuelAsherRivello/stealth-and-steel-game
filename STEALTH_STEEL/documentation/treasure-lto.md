# G2. LTO Treasure Chest

The game consumes the published BIS 0.14.1 release package recorded in `vendor/bis-package-inventory.json`.

## Setup and current availability

Run the BIS wallet service with `npm run wallet:service` from the BIS repository. Its default local endpoint is http://127.0.0.1:8787/. Import the game wallet once in BIS Admin at http://127.0.0.1:5174/ → F. Game Wallet. The service saves it to private disk and restores it after restart. Admin can close. An eligible previously selected Admin browser wallet migrates automatically; no separate game import is needed.

Open http://127.0.0.1:5173/. For first-time setup, click Start, then use the gear → Account to connect the player. The Start overlay covers Settings. Reload after connecting, let wallet readiness finish, then click Start for a fresh Level01 run. Walk two cells upward into the treasure within 90 seconds and choose Claim or Reject. Pending feedback closes the dialog; confirmed feedback is a passive toast during gameplay. The game also exposes Account → Contracts for inspection.

Local and hosted games use the same BIS service API. Configure the public `VITE_BIS_WALLET_SERVICE_URL` before building for deployment. It must point to the deployed HTTPS wallet service, which runs separately from GitHub Pages. The local service is verified; no deployed signer endpoint has been selected or verified. See the BIS `BIS/packages/wallet-service/README.md` for the private-volume, origin and Admin-proxy setup.

Contract creation is enabled by default in the BIS public factory. Each attempt validates real wallet readiness, provider terms, fees, eligible inputs and contract/session state. A separate funded probe page or acceptance click is not required. Hosts may explicitly use creationEnabled:false to stop new offers while preserving existing-contract recovery. A usable zero-balance player may receive a funded claim; the game needs enough eligible unreserved sats for the 1,000-sat reward and any required asset-preserving change and supported zero-fee terms. An old unresolved offer causes the next session to skip funding rather than queue a late replacement.

## Game behavior

The existing Start click immediately starts the game and a 90-second wall-clock deadline. The game-owned session controller attempts creation once, queries only its exact treasureLTO purpose/session/reference/player/game, and never extends eligibility for pause, funding latency, hidden tabs or continuation. Level progression carries the original deadline; finishing the run, leaving it, or starting another session requests cleanup. Closing the browser does not stop the hosted service. Its recovery worker refunds eligible expired offers while the service runs. A stopped service resumes durable recovery on restart.

Level01 contains one TreasureChestSpawner at Tiled column 4, row 11 (game cell 3,5; runtime center 224,352). In a fresh Level01 run it is two cells above the player. The chest always spawns and uses a nonblocking sensor. Entering opens the game-owned Treasure Chest window and adds only the treasure pause reason. Back resumes play; leave and re-enter the sensor to reopen. Claim or Reject closes after durable action acceptance; BIS pending/confirmed toasts remain passive. Expired offers show disabled Claim/Reject and Back, including after their verified refund.

The authored palette is `public/assets/levels/tiled/tilesets/TreasureChestSpawner.tsj`. Its SVG is editor artwork; the runtime uses the accompanying PNG because Babylon's image upload did not decode the SVG reliably. Reopen the Tiled project/map after changing palette definitions. Actual Tiled editor interaction and physical-device touch acceptance have not yet been performed.

BIS owns the generic financial contract, encrypted recovery journal, reserved inputs, signing, verified receipts, and Account → Contracts. The game owns purpose, deadline, placement, collision, pause, dialog and session transitions. Game wallet import belongs only to BIS Admin; the game has no game-wallet import control.

## Verification

BIS package hash/inventory verification and the game production build pass. Real-browser Level01 checks cover the visible chest, collision, guest message, movement pause, Back, overlap debounce, re-entry and a 360×640 viewport. This is browser emulation, not physical-device verification. Full-game live funded claim/refund remains unobserved. Hosted isolated-operator acceptance covers real SDK funding, both browser claim signatures, asset preservation, refunds, unknown-submission recovery and a restart during checkpoint signing. Existing unrelated Level02/collider test failures are recorded in the coordinating BIS OpenSpec verification document.

The BIS Admin G2 demonstration now uses always-clickable Start LTO and Claim LTO subbuttons, a 90-second countdown, and its existing console. Those are demo host controls; the actual game retains its collision-driven dialogue.


Historical client acceptance: 17 focused game tests passed for the account host, session persistence/continuation, all treasure states, duplicate/late responses, keyboard/touch isolation, focus, signer setup, sensor placement and runtime artwork. A late Claim result now closes only its originating chest window. The actual game Account UI reports BIS v0.14.1. The current archive is recorded in the inventory and provenance. Tiled headless map/tileset export was attempted but crashed, so editor save/reload remains unverified. No additional human testing handoff is requested.

Runtime acceptance restructuring (2026-09-09): the unconditional live-acceptance disable was removed at the user's request. BIS 54 focused tests and the isolated two-tab browser suite pass. Historical live probes and unobserved extended live scenarios are reported separately from automated acceptance. Current runtime package and its hash are recorded in the vendor inventory; both builds pass.

Asset-carrier fix: funding now supports game outputs that also hold assets. It prefers asset-free inputs and otherwise returns every asset with game-owned change, leaving the contract asset-free. Exact quantities are journaled and verified before confirmation. Failure to prepare now includes a sanitized reason.


Shared wallet acceptance (2026-09-09): 16 focused game tests cover the current host and treasure flow after removal of the obsolete import-dialog test. The actual game fetches the hosted public wallet, has no Game Wallet import button, and passes guest collision, pause, Back, re-entry and mobile layout checks. The saved local wallet restored ready after service restart. These checks did not spend from a user wallet. X8 retains the deferred wallet-security review.
