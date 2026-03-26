# Widget Architecture

## Goal

Support three widget categories with one shared UI language:

1. `shell widgets`
   Structural interface blocks that live inside persistent panel shells such as the left layer/control panel.
2. `global widgets`
   Opened from the top-right `Widgets` button.
3. `entity widgets`
   Opened from a specific entity such as a `pin`, `path`, and later `polygon`.

The system must use one shared API contract for entities and widgets so it can later be indexed and reused for AI workflows and vector databases without per-entity branching everywhere.

This document now sits under the broader `entity container` model described in:

`documentation/entity-container-architecture.md`

The shell/container side of this system is now further described in:

`documentation/shell-motion.md`

`documentation/shell-data-model.md`

## Library rule

Each widget should live as its own file inside the widget library.

That means:

1. one widget module = one instrument
2. shell files wire widgets together but do not define widget internals
3. shared helpers such as counters, empty states, and binding adapters may live next to the widget in the library

This keeps widgets portable so the same widget can be connected to a different shell or binding contract later without dragging shell-specific code with it.

The shell itself should live outside the widget library.

Practical rule:

1. `components/shells/*` = shell containers, runtime, orchestration
2. `components/widgets/shell-widgets/*` = widgets that can be mounted into a shell
3. shell-specific bindings may live next to the widget they adapt, but the shell container still stays outside the widget library

## Panel model

Panels and widgets are not the same thing.

The panel is the shell.
The widget is the composable block inside that shell.

### 1. Panel shells

Current panel shells:

1. `left shell`
   Navigation and creation surface for layers, modes, and map controls.
2. `right shell`
   Entity-focused inspection and editing surface.
3. `widget center shell`
   Global widget surface opened from the top-right button.

Each panel shell should be responsible only for:

1. placement
2. open / close behavior
3. motion orchestration
4. scroll containment
5. mobile / desktop presentation

Each panel shell should not own widget business logic directly.

### 2. Widget categories

#### Shell widgets

These are widgets that belong to a shell rather than to a specific entity.

Examples in the left shell:

1. app header widget
2. search widget
3. mode switch widget
4. layer list widget
5. map controls widget
6. action widgets such as `new layer`, `finish path`, `remove point`, `reset view`
7. top chrome control widget for brand + show/hide launcher

Shell widgets are still widgets even if they are currently implemented as ordinary UI sections.

Action cards should not be grouped into one catch-all widget when they represent separate instruments.

Prefer:

1. `shell_create_collection`
2. `shell_reset_view`
3. `shell_finish_trace`
4. `shell_remove_trace_point`

instead of one monolithic `shell_actions` widget.

#### Entity widgets

These are widgets attached to one normalized entity payload.

Examples:

1. `entity_info`
2. `entity_delete`
3. future media, metadata, provenance, or AI widgets

#### Global widgets

These are not tied to a single entity but still use the same widget composition idea.

Examples:

1. overview widgets
2. dashboard widgets
3. future workspace-wide widgets

## Core backend model

### 1. Widget definitions

This is the widget library.

Each definition describes:

1. widget slug
2. widget display name
3. widget layer: `global` or `entity`
4. supported entity types
5. component key
6. default config payload

Definitions are reusable templates, not actual placements.

### 2. Widget instances

This is the placement layer.

Each instance links:

1. a widget definition
2. a user
3. a layer: `global` or `entity`
4. an optional entity reference
5. ordering / position
6. config override
7. state payload

This allows the same widget definition to be instantiated globally or attached to many different entities.

Note:

`shell widgets` are now backed by `widget_definitions`, `widget_instances`, and `widget_placements`.
The current shells are still intentionally constrained, but the system is no longer just conceptual.

## Shared entity contract

Every entity widget must resolve through the same normalized entity payload:

1. `entity.id`
2. `entity.type`
3. `entity.title`
4. `entity.subtitle`
5. `entity.description`
6. `entity.imageUrl`
7. `entity.collection`
8. `entity.geometryKind`
9. `entity.metadata`

This keeps the widget component API stable across `pin`, `trace`, and later `area`.

## Motion contract

Motion should be defined at the panel shell level first and at the widget level second.

### Panel shell motion

Each shell should orchestrate:

1. initial reveal
2. enter / exit
3. backdrop behavior
4. scroll stability
5. child staggering

### Widget motion

Each widget should follow one shared contract:

1. no layout jump on first render
2. no independent dramatic entrance if the shell is still entering
3. quiet reveal through opacity + small translation only
4. preserve layout height where async content is expected
5. use placeholders or skeletons instead of popping in real content late

This means:

1. the left shell should feel like one composed surface made of shell widgets
2. the right shell should feel like one entity surface made of entity widgets
3. `global widgets` should follow the same widget rhythm when opened

## First widget

The first serious shared widget is `entity_info`.

It reads only from the normalized entity payload and should work for:

1. `pin`
2. `trace`
3. later `area`

The first global widget is `global_overview`.

The destructive companion widget is `entity_delete`.

It is separate from `entity_info` because deletion is a view-level operation over the whole entity and its associated widget data, not a field inside one informational widget.

## Current implementation status

1. `widget_definitions` and `widget_instances` are the backend foundation.
2. `Widget Center` should read from `global` widget instances.
3. The entity overlay should read normalized entity payload plus `entity` widget instances.
4. The left panel and top chrome should now be understood as shells composed of shell widgets.
5. Pin editing is not a separate overlay concept anymore in architecture terms; it should be delivered through the `entity_info` entity widget.
6. The same `entity_info` widget contract must stay valid for `pin`, `trace`, and later `area`, with richer editing enabled only where supported.
7. Entity deletion must be exposed through a separate `entity_delete` widget, not embedded inside `entity_info`.
8. Editable entity fields such as a pin title or curator note should prefer quiet background save over explicit save buttons when the operation is low-risk and field-local.
9. Motion should be standardized across shell widgets and entity widgets so both sides of the interface feel like one product system.

## Rules

1. Do not create separate widget APIs for `pin` and `path`.
2. Do not make widgets query raw entity tables directly from the UI.
3. Keep the widget library separate from widget placements.
4. Future entity types must fit the same contracts without a redesign.
5. Deleting an entity must also delete its associated `entity` widget instances and any widget state attached to those instances.
6. For local pin media uploads, entity deletion should also attempt to remove the uploaded file from storage.
7. Treat the left panel as a shell made of widgets, not as a special monolith outside the widget system.
8. Keep shell motion in the panel shell and widget motion inside each widget block.
9. Avoid panel experiences where content appears in visible asynchronous chunks without reserved layout.

## Revision note

The next evolution of this architecture is:

1. layer-level destructive flows still need to be reconciled with archive-first container lifecycle
2. media and other enrichments become associated container data, not ad-hoc fields
3. widgets remain mediators that fetch and save their own enrichment data through separate queries

## TEMP / Tech Debt

Current temporary decisions:

1. `entity_info` still reads some transitional fields that originate from legacy entity tables
2. local pin media still flows through direct pin media fields before the dedicated enrichment model exists
3. global widget cards may still use fallback presentation data until widget config/state is fully authorable
4. pin title autosave currently updates legacy pin fields directly while the canonical container/enrichment write path is still being completed
5. shell widgets in the left panel are still mostly static component sections rather than persisted widget instances
