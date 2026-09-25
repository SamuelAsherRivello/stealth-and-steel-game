# Spec Delta

## Purpose

Provide readable, consistent, accessible tooltips for game UI controls while ensuring tooltip text remains entirely inside the visible game frame at every supported layout.

## ADDED Requirements

### Requirement: Shared tooltip behavior

The game SHALL provide a reusable tooltip behavior that can be attached to game UI controls and SHALL show the control's explanatory text when the pointer hovers over it or when it receives keyboard focus.

#### Scenario: Pointer hover
- **WHEN** a pointer rests over a tooltip-enabled control
- **THEN** the tooltip becomes visible with the configured explanatory text

#### Scenario: Keyboard focus
- **WHEN** a tooltip-enabled control receives keyboard focus
- **THEN** the tooltip becomes visible with the configured explanatory text

### Requirement: Tooltip presentation stays within the game frame

The tooltip SHALL use the game's shared UI visual language, remain readable, and keep its complete rendered bounds inside the visible game frame by adapting its placement around the associated control.

#### Scenario: Control near an edge
- **WHEN** a tooltip-enabled control is near any edge of the visible game frame
- **THEN** the tooltip flips or clamps its placement so no tooltip text or border is clipped outside the game frame

#### Scenario: Responsive layout change
- **WHEN** the game frame changes size, orientation, fullscreen state, or visible viewport
- **THEN** an active tooltip is repositioned or hidden and shown again so its complete bounds remain inside the recalculated game frame

### Requirement: Items button explains its availability state

The main-menu Items button SHALL expose the exact tooltip text `Manage blockchain game items.` when enabled and SHALL expose the exact tooltip text `Manage blockchain game items. Login wallet in Account menu` when disabled.

#### Scenario: Items is enabled
- **WHEN** the main-menu Items button is supported and enabled
- **THEN** its tooltip text is `Manage blockchain game items.`

#### Scenario: Items is disabled
- **WHEN** the main-menu Items button is visible but disabled
- **THEN** its tooltip text is `Manage blockchain game items. Login wallet in Account menu`

