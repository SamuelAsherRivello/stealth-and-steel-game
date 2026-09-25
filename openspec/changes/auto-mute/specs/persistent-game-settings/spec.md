## MODIFIED Requirements

### Requirement: URL audio mute defaults

The game SHALL accept independent `muteMusic` and `muteSFX` URL parameters. For
each category, the game SHALL request a mute only when the parameter has the
exact value `true`. When the parameter is absent or has another value, the game
SHALL leave that category's persisted volume unchanged.

#### Scenario: Normal URL omits audio parameters

- **WHEN** the game starts without `muteMusic` or `muteSFX` parameters
- **THEN** persisted Music and SFX values remain active
- **AND** newly created audio uses those stored category volumes

#### Scenario: AI window requests both mutes

- **WHEN** the game starts with `?muteMusic=true&muteSFX=true`
- **THEN** Music and SFX settings are set to zero for the active session
- **AND** newly created audio uses zero output volume

#### Scenario: Music mute is independent

- **WHEN** the game starts with `?muteMusic=true` and no `muteSFX` parameter
- **THEN** Music is muted for the active session
- **AND** persisted SFX remains active

#### Scenario: SFX mute is independent

- **WHEN** the game starts with `?muteSFX=true` and no `muteMusic` parameter
- **THEN** SFX is muted for the active session
- **AND** persisted Music remains active

#### Scenario: Explicit true requests a mute

- **WHEN** either category parameter has the exact value `true`
- **THEN** the matching category is set to zero for the active session
- **AND** the other category follows its own parameter independently

### Requirement: Category volume contract

Music and SFX settings SHALL define category multipliers for audio playback. New
audio playback SHALL apply the current category setting, including the URL
audio-mute result, while the absence of an audio asset or active audio instance
SHALL NOT cause an error.
