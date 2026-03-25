# Widget Architecture

## Goal

Support two widget layers with one backend model:

1. `global widgets`
   Opened from the top-right `Widgets` button.
2. `entity widgets`
   Opened from a specific entity such as a `pin`, `path`, and later `polygon`.

The system must use one shared API contract for entities and widgets so it can later be indexed and reused for AI workflows and vector databases without per-entity branching everywhere.

This document now sits under the broader `entity container` model described in:

`documentation/entity-container-architecture.md`

## Core model

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
4. Pin editing is not a separate overlay concept anymore in architecture terms; it should be delivered through the `entity_info` entity widget.
5. The same `entity_info` widget contract must stay valid for `pin`, `trace`, and later `area`, with richer editing enabled only where supported.
6. Entity deletion must be exposed through a separate `entity_delete` widget, not embedded inside `entity_info`.
7. Editable entity fields such as a pin title or curator note should prefer quiet background save over explicit save buttons when the operation is low-risk and field-local.

## Rules

1. Do not create separate widget APIs for `pin` and `path`.
2. Do not make widgets query raw entity tables directly from the UI.
3. Keep the widget library separate from widget placements.
4. Future entity types must fit the same contracts without a redesign.
5. Deleting an entity must also delete its associated `entity` widget instances and any widget state attached to those instances.
6. For local pin media uploads, entity deletion should also attempt to remove the uploaded file from storage.

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
