# Spec Delta

## ADDED Requirements

### Requirement: Trophy ownership is prefetched for an active game session
For each configured level trophy whose BIS asset-minting capability is available,
the game SHALL begin its ownership check asynchronously when the player starts
that game session. The completion prompt SHALL consume the same in-progress or
settled ownership result and SHALL remain visible and navigable without waiting
for an additional initial ownership check. Missing configuration, unavailable
capability, guest state, unavailable BIS service, and a failed or unresolved
prefetch SHALL retain the existing non-blocking trophy fallback and manual
ownership-check recovery behavior.

#### Scenario: Ownership settles before level completion
- **WHEN** a player starts a game session, the configured trophy ownership check
  succeeds, and the player later reaches that level's exit
- **THEN** the completion prompt immediately uses the settled ownership state
- **AND** it does not start a second initial ownership check for that trophy

#### Scenario: Level completes while prefetch is pending
- **WHEN** a player reaches a configured level exit before its session-start
  ownership check settles
- **THEN** the completion prompt is displayed immediately with its existing
  non-blocking checking state
- **AND** it updates from the shared result when that check settles without
  blocking Continue or Restart Game

#### Scenario: Stale prefetch cannot affect a new session
- **WHEN** a player restarts, advances to another level, reloads, or otherwise
  replaces a game session while a prior session's ownership check is pending
- **THEN** the prior result cannot alter the current session's completion
  prompt or trophy actions
- **AND** the prior session's ownership resources are released
