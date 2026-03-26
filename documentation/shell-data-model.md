# Shell Data Model

## Goal

Define a safe v1 data model for:

1. `shells`
2. `widgets`
3. `widget placement inside shells`

The model should be:

1. composable
2. easy to reason about
3. easy to extend
4. safe for future drag-and-drop and user customization

## Core decision

We do not model the interface as:

1. hardcoded left panel
2. hardcoded right panel
3. hardcoded block lists inside JSX

We model it as:

1. `shell`
   A persisted container entity
2. `widget definition`
   A reusable widget type
3. `widget instance`
   A concrete widget record for a user/context
4. `widget placement`
   The placement of a widget instance into a shell, with ordering

## Why this model

This model balances two architectural patterns:

1. block-tree style composition
   Parent/child structures are a proven way to model composable UI systems.
2. dashboard/panel layout systems
   Dashboards typically separate the panel definition from the panel placement/order/size.

The practical lesson is:

1. identity should be separate from placement
2. placement should be explicit
3. ordering should not live inside arbitrary JSON blobs

## Entities

### Shell definition

Describes what a shell is by default.

Examples:

1. `left_sidebar`
2. future `right_entity_panel`
3. future `bottom_tray`

This record should hold:

1. slug
2. name
3. kind
4. scope
5. default config
6. default state

### Shell instance

A concrete shell record for a specific owner.

The owner can later be:

1. user
2. workspace
3. entity
4. system

For v1 we use:

1. `owner_type = user`
2. `owner_id = user.id`

This allows:

1. per-user shell preferences
2. persisted hide/show state
3. persisted width and section config

### Widget definition

The reusable widget type.

Examples:

1. `entity_info`
2. `entity_delete`
3. `shell_header`
4. `shell_search`
5. `shell_collections`

This is not a concrete widget placed on screen.

### Widget instance

A concrete instance of a widget definition.

This is where user/context-specific widget config and state live.

The same definition can have:

1. many instances
2. different titles
3. different local config/state

### Widget placement

The explicit relation between:

1. one shell instance
2. one widget instance

This is where ordering belongs.

For v1, each placement stores:

1. `shell_instance_id`
2. `widget_instance_id`
3. `slot`
4. `position`

## Why placement is separate

Ordering and containment should not be hidden in shell config JSON.

Reasons:

1. drag-and-drop becomes much easier
2. reordering is one cheap DB update pattern
3. widgets can move between shells cleanly
4. shell config stays focused on shell behavior, not content tree mutations

## Current v1 schema

### Persisted shell layer

1. `shell_definitions`
2. `shell_instances`

### Persisted widget layer

1. `widget_definitions`
2. `widget_instances`

### Persisted composition layer

1. `widget_placements`

## Current v1 constraints

This iteration is intentionally disciplined.

We do not yet support:

1. arbitrary nested shells in runtime
2. arbitrary slot builders
3. freeform layout editors
4. unbounded tree depth

We do support:

1. persisted shell identity
2. persisted default shell config
3. persisted shell widget ordering
4. shell widget rendering from DB-backed placements

## Why this is safer than full shell nesting now

A fully recursive shell tree is powerful, but expensive too early.

Main risks:

1. runtime complexity
2. harder debugging
3. circular or invalid composition states
4. more motion orchestration edge cases
5. larger UX/performance surface before the model is mature

So v1 chooses:

1. one real shell entity
2. one real placement layer
3. widgets as first-class records
4. no full recursive shell tree yet

## Best-practice heuristics adopted

We are following these practical heuristics:

1. Separate definition from instance
2. Separate instance from placement
3. Keep order in a first-class field like `position`
4. Keep shell config small and strongly shaped
5. Avoid turning config JSON into a giant UI DSL too early
6. Prefer explicit composition tables over implicit nested blobs

## Next evolution

If shell-in-shell becomes necessary later, the likely next step is:

1. introduce `shell_children`
2. allow a child to be either a shell or a widget
3. keep widget as leaf
4. keep shell as branch

That would be a v2 tree model.

It is not required for the current product to gain the main benefits of persisted shell architecture.
