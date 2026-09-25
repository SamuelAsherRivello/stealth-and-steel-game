# Spec Delta

## ADDED Requirements

### Requirement: Inventory cards use a compact four-card presentation

The system SHALL present owned equipment as selectable square cards in a
centered two-column grid with exactly 2px gaps between rows and columns. Each
card SHALL occupy one-quarter of the former single-card presentation area, so
the ready Items layout visibly accommodates four cards in a 2-by-2 footprint
inside the existing portrait menu frame. The layout SHALL retain the item name,
sats price, Speed, Offense, and Defense values without overlap.

#### Scenario: Four-card Shoes layout

- **WHEN** the Items content displays the temporary four-copy Shoes I preview
- **THEN** it displays four square Shoes I cards in two rows and two columns
- **AND** each horizontal and vertical gutter is exactly 2px
- **AND** the complete grid remains visible without a dialog or grid scrollbar

## MODIFIED Requirements

### Requirement: Equipment selection remains clear and unchanged

The Items dialog SHALL open at its ready-state height and immediately display
the exact shared Tiny Swords body text `Loading ...` while the inventory request
is pending, with the BIS loading menu layered above it. Once the request
settles, it SHALL replace that loading text with `You may activate one of each
item type to empower your gameplay.` using the same Tiny Swords body-text color
and typography used by other menu windows. The game SHALL use that same BIS
loading menu while a real item select or clear request is pending, and it SHALL
call `showLoading()` only when `isBisVisible()` is false, then hide only its own
host loading entry when that request settles. The dialog SHALL
preserve existing card details and selection behavior, and make an active item
visually distinct without relying solely on text. The game SHALL expose item
support as a lower-camel-case `hasItemSupport()` capability. Item support SHALL
be available when the Player Wallet is active and BIS item access is available,
without requiring a selected or ready Game Wallet.

#### Scenario: Player selects an item

- **WHEN** the player activates an unselected equipment card
- **THEN** that card becomes the active item for its type using the existing
  equipment selection behavior
- **AND** the active visual state is visibly stronger than an inactive card
- **AND** the game shows its loading entry only when BIS is not already visible
- **AND** that entry never dismisses or interrupts an active BIS operation

#### Scenario: Items opens while inventory is pending

- **WHEN** a supported player opens Items before the equipment provider or
  inventory refresh settles
- **THEN** the dialog immediately occupies the same height it will use when
  cards are ready
- **AND** its body displays exactly `Loading ...`
- **AND** the BIS loading menu is visible above the Items dialog

#### Scenario: Inventory becomes ready

- **WHEN** the inventory request succeeds
- **THEN** the loading text is replaced by `You may activate one of each item
  type to empower your gameplay.` in the shared Tiny Swords body-text treatment
- **AND** selecting an unselected card or clearing a selected card retains the
  existing equipment behavior and visibly distinct active state

#### Scenario: Player Wallet supports items without a Game Wallet

- **WHEN** the Player Wallet is logged in and active and no Game Wallet is selected
- **THEN** `hasItemSupport()` returns true
- **AND** the Items entry point remains available

#### Scenario: Player is not logged in

- **WHEN** the Player Wallet is not active
- **THEN** `hasItemSupport()` returns false
- **AND** the game does not present Items as available

#### Scenario: BIS item access is unavailable

- **WHEN** the account or BIS item service cannot be initialized
- **THEN** `hasItemSupport()` returns false
- **AND** ordinary gameplay remains available

#### Scenario: Trophy reward is completed

- **WHEN** the game mints and transfers a one-at-a-time trophy reward
- **THEN** the trophy flow remains independent of `hasItemSupport()` and its Game Wallet requirement

## REMOVED Requirements

### Requirement: Inventory cards use available portrait space

**Reason**: The count-adaptive, up-to-nine-card contract conflicts with the
requested fixed four-card visual approval layout and quarter-area cards.

**Migration**: Items now uses the compact four-card presentation requirement;
future larger-inventory behavior requires a separately scoped design.
