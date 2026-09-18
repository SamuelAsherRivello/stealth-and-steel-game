# bis-host-game-contract Specification

## Purpose

Define the game-owned contract BIS uses after a verified operation, preserving
gameplay independence while making continuation and reward delivery reliable.

## Requirements

### Requirement: Game consumes a verified pinned BIS release artifact
The game SHALL consume `@bis/integration` from a locally vendored packed tarball
whose package metadata, SHA-256, and file inventory are recorded in repository
provenance metadata. The dependency SHALL resolve to the exact verified artifact
used for the build rather than a BIS source-folder path or an unbounded remote
branch.

#### Scenario: Local BIS artifact is prepared
- **WHEN** the BIS update workflow packs the adjacent repository's integration
  package
- **THEN** the game records the tarball path, package version `0.0.1`, SHA-256,
  and packed-file inventory before installing or building with it

#### Scenario: Dependency installation is repeated
- **WHEN** a developer installs the game from its lockfile
- **THEN** npm resolves the recorded vendored tarball and does not require the
  adjacent BIS checkout, a source symlink, or a mutable GitHub branch

### Requirement: BIS update verification is credential-free
The game-side BIS update verification SHALL inspect package contents and public
API compatibility, run applicable tests/typechecks/builds, and SHALL NOT request,
print, commit, or use wallet secrets or perform wallet operations.

#### Scenario: Verification runs without wallet setup
- **WHEN** the package update checks execute in a checkout without wallet
  credentials or a configured account
- **THEN** package and game verification can complete without exposing secrets or
  broadcasting, signing, or initiating a payment

### Requirement: Game fulfills one published host contract
The game SHALL fulfill the published `BisHostGame` contract from the exact
verified vendored BIS artifact and SHALL use no BIS internal source path or
Arkade type. The contract SHALL contain active-session reference,
continuation-target capture, confirmed-continuation application, and
confirmed-player-reward presentation capabilities. The game SHALL remain
playable when the BIS package, account, or connectivity is unavailable.

#### Scenario: Game starts without a BIS account
- **WHEN** a player starts a normal game session without an available BIS account
- **THEN** gameplay proceeds without a host delivery or wallet-dependent action

#### Scenario: Game creates the BIS adapter
- **WHEN** the game initializes its BIS integration
- **THEN** it provides the complete published host contract through the verified
  vendored package's public API only

#### Scenario: Contract remains compatible after the local update
- **WHEN** the game builds and runs its BIS contract checks against the pinned
  artifact
- **THEN** the published host contract is accepted without importing BIS
  internal source paths or Arkade types

### Requirement: Continuation target is game-defined and session-bound
Before requesting a paid continuation, BIS SHALL obtain an active game-session reference and a game-defined continuation target. BIS SHALL treat the target as opaque and SHALL bind it, the session, and one stable operation identifier to the resulting continuation record. The game SHALL return no target when a continuation cannot safely apply to the active session.

#### Scenario: Defeat has a valid continuation target
- **WHEN** the player reaches the paid-continuation loss state in an active session
- **THEN** the game supplies a target that identifies that game-owned continuation effect without exposing gameplay semantics to BIS

#### Scenario: No active continuation target exists
- **WHEN** the game has no matching active loss or session
- **THEN** it supplies no target and BIS does not initiate a continuation payment for that game effect

### Requirement: Confirmed continuation delivery is typed and idempotent
BIS SHALL request a continuation effect only after independently confirming its financial operation. The game SHALL evaluate delivery against the bound active session and stable operation identifier, then return a typed receipt of `applied`, `already-applied`, or `not-applicable`. A result for a prior, ended, or reloaded session SHALL be `not-applicable` and SHALL not modify the current run. A failed or unavailable game effect SHALL not cause BIS to charge again, reverse confirmed financial state, or deliver the effect to another session.

#### Scenario: Matching confirmed continuation revives the current loss
- **WHEN** BIS delivers a confirmed operation that matches the active defeat session and its continuation target
- **THEN** the game applies its existing paid-revival behavior once and returns `applied`

#### Scenario: Delivery is replayed for the same session
- **WHEN** BIS redelivers an already-applied confirmed continuation with the same operation identifier and session
- **THEN** the game returns `already-applied` and does not revive, remove enemies, or resume play a second time

#### Scenario: Delivery arrives after a new run begins
- **WHEN** a confirmed continuation for an old session arrives after restart, reload, or session replacement
- **THEN** the game returns `not-applicable` and the new run remains unchanged

### Requirement: Confirmed player reward presentation is game-owned
After BIS independently confirms a player-owned reward, BIS SHALL provide the bound session, stable operation identifier, reward identifier, and display metadata to the game. The game SHALL return the same typed delivery receipt and SHALL choose its own artwork, wording, UI placement, and gameplay effect. A reward-presentation outcome SHALL not cause BIS to mint, transfer, or charge again.

#### Scenario: Active session presents a confirmed reward
- **WHEN** BIS delivers a confirmed reward for the active session
- **THEN** the game presents its game-owned reward feedback and returns `applied`

#### Scenario: Reward has no applicable game session
- **WHEN** BIS delivers a confirmed reward for an ended or unknown session
- **THEN** the game returns `not-applicable` without changing a current session or replaying the BIS operation
