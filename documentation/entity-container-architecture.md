# Entity Container Architecture

## Core idea

When a user creates a `pin`, we are not just creating a marker on the map.

We are creating an `entity container`.

That container is the canonical business object.

At creation time it contains only:

1. raw data received from the map
2. minimal system metadata
3. layer / collection association

After that, the container can be enriched over time.

## Container lifecycle

### 1. Creation

The container is born from map interaction.

Initial payload should include:

1. entity id
2. entity type
3. geometry from the map
4. created at
5. user id
6. layer / collection id
7. lifecycle status

### 2. Enrichment

The container is then enriched by widgets.

Widgets are not the data itself.

Widgets are mediators that:

1. read base entity data from the container
2. fetch additional associated data through separate queries
3. save additional associated data back into the container ecosystem
4. present the entity in different business views

Examples of enrichment:

1. media
2. notes
3. future structured metadata
4. external lookups
5. AI-generated summaries

## Widget responsibility

Each widget should know:

1. how to read the base entity contract
2. how to fetch its own extra data separately
3. how to write its own enrichment data separately
4. how to persist changes without redefining the entity model

Important rule:

Widgets must not collapse all associated data into one giant entity record.

Instead:

1. the entity container holds the core identity and lifecycle
2. enrichment data is attached through dedicated associated tables / records
3. widget instances remain view-level mediators

## Media storage direction

Media files should not live permanently inside the main app server filesystem.

The target model is:

1. binary media stored on a separate media server / object storage
2. the main database stores references and metadata only
3. widgets read and write media through associated enrichment records, not through ad-hoc entity columns

This means the long-term container ecosystem should include:

1. media provider / storage backend metadata
2. storage key
3. public or signed access strategy
4. media lifecycle fields

## Deletion model

Deletion should not immediately hard-delete the entity container.

Instead:

1. the entity container should move to `archived`
2. archived entities can later be surfaced in global widgets
3. after a retention window of one month, archived entities can be permanently deleted

This means the lifecycle should at minimum support:

1. `active`
2. `archived`
3. later optional retention / purge states if needed

## Archive semantics

Archiving a container should preserve:

1. core entity record
2. associated enrichment data
3. widget-linked associated data
4. media references while retention is active

The user-facing delete action is therefore business-level archive first, purge later.

## View architecture

There are two widget layers:

1. global widgets
2. entity widgets

Global widgets can later surface:

1. active entities
2. archived entities
3. summaries across containers

Entity widgets operate on one container and enrich it.

## Database direction

The target model should move toward:

1. an entity container table as the canonical root
2. specialized geometry / entity-type tables or records if still needed
3. enrichment tables for media and other business data
4. widget definitions as library records
5. widget instances as view bindings
6. archive timestamps and purge scheduling fields

## Immediate practical rule

Even if the current schema still uses `pins`, `traces`, and `areas`, all new widget architecture work should behave as if the canonical model is:

1. container first
2. enrichment second
3. widget mediation third
4. archive first, purge later

## Current implementation status

1. New `pin`, `trace`, and `area` records now create an `entity_container` alongside the geometry record.
2. The old entity tables still exist and remain part of the transitional model.
3. Individual entity delete now archives the container first when a container exists.
4. Legacy rows without a container still require transitional fallback behavior.

## TEMP / Tech Debt

The following are temporary and must stay explicitly marked until replaced:

1. direct `note` and `image_url` fields on `pins`
2. local `/public/uploads` media storage
3. hard links between old entity tables and transitional widget reads
4. any hard delete path that should become archive-first later

Rule:

If we add a transitional implementation, it must be labeled as temporary in code or docs so we can return to it intentionally.
