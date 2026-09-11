## Purpose

Define the game-owned contract BIS uses after a verified operation, preserving
gameplay independence while making continuation and reward delivery reliable.

## ADDED Requirements

### Requirement: Game fulfills one published host contract
The game SHALL fulfill the published `BisHostGame` contract from the BIS package and SHALL use no BIS internal source path or Arkade type. The contract SHALL contain active-session reference, continuation-target capture, confirmed-continuation application, and confirmed-player-reward presentation capabilities. The game SHALL remain playable when the BIS package, account, or connectivity is unavailable.

#### Scenario: Game starts without a BIS account
- **WHEN** a player starts a normal game session without an available BIS account
- **THEN** gameplay proceeds without a host delivery or wallet-dependent action

#### Scenario: Game creates the BIS adapter
- **WHEN** the game initializes its BIS integration
- **THEN** it provides the complete published host contract through the package's public API only

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
