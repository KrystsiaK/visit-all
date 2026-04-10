# Widget Placement Policy

## Goal

Define placement as a first-class rule layer instead of treating it as a side effect of widget settings.

This layer answers:

1. where a widget is allowed to live
2. whether it is always present
3. whether it can be removed
4. whether it can exist in one panel or many panels
5. whether the widget pool should auto-place it or ask the user to choose a panel

## Core Principle

Placement is owned by the widget pool and the app-level orchestration layer.

Widgets do not decide where they live.
Shells do not invent placement rules locally.
Widget settings do not provide cross-panel movement.

## Placement Modes

### 1. `required_fixed`

The widget is always present in a specific panel.

Rules:

1. it cannot be removed
2. it cannot be moved
3. the pool shows it as system-managed
4. the pool does not offer add controls

Examples:

1. `entity_info`
2. current system shell widgets

### 2. `single_fixed_host`

The widget may exist only in one specific panel.

Rules:

1. the pool may add it automatically to that host
2. if it is already present there, the pool disables add
3. the widget itself does not expose move

Examples:

1. current `entity_gallery`
2. current `entity_resources`
3. current `entity_rating`

### 3. `single_selectable_host`

The widget may live in one of several panels, but only one at a time.

Rules:

1. the pool must ask which host to use
2. once placed, the pool disables alternative placement until it is removed
3. widgets still do not expose move; re-placement happens through the pool

### 4. `multi_host`

The widget may live in multiple panels simultaneously.

Rules:

1. the pool offers host selection for one or many allowed hosts
2. the same widget concept may be placed into multiple shells
3. each placement is still governed by `widget_placements`

## Current Product Rule

For `visit-all` today:

1. left shell widgets are treated as fixed system placements
2. entity widgets currently auto-place into the native shell for the active entity type
3. widget settings expose remove when allowed, but do not expose move
4. host vocabulary stays canonical through `src/lib/widget-hosts.ts`
5. placement policy is evaluated before add actions in the widget pool

## Why This Matters

This keeps the architecture strict:

1. pool = source of truth for placement
2. shell = host surface
3. widget = content + settings + bindings only
4. data layer = persistence

That is the only way to support future cross-panel widget strategies without reintroducing ad-hoc movement logic inside widget cards.
