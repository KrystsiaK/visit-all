# Entity Widget Expansion Plan

## Goal

Define the next serious set of entity widgets using the existing shell/widget/container architecture.

These widgets should not be treated as ad-hoc fields inside one giant entity editor.

They should be modeled as:

1. independent widget definitions
2. independent enrichment records
3. shell-hosted entity widgets inside the right entity shell

## New widgets

### 1. `entity_gallery`

Purpose:

1. attach many photos to one entity
2. browse them as a gallery
3. reorder or remove them later

Supported entity types:

1. `pin`
2. `trace`
3. `area`

Widget config:

1. `kind = gallery`
2. `allowMultiple = true`
3. optional `maxItems`

Persistence direction:

1. do not store this in legacy `image_url`
2. use a dedicated enrichment table for media items
3. store one record per asset with:
   - `entity_container_id`
   - `storage_key`
   - `public_url`
   - `caption`
   - `position`
   - `created_at`

### 2. `entity_stories`

Purpose:

1. attach one or more story entries to an entity
2. support long-form notes
3. support markdown syntax

Supported entity types:

1. `pin`
2. `trace`
3. `area`

Widget config:

1. `kind = stories`
2. `format = markdown`
3. `allowMultiple = true`

Persistence direction:

1. use a dedicated text enrichment table
2. one record per story entry:
   - `entity_container_id`
   - `title`
   - `body_markdown`
   - `position`
   - `published_at`
   - `created_at`
   - `updated_at`

### 3. `entity_resources`

Purpose:

1. store external references
2. support many links
3. support source title + URL

Supported entity types:

1. `pin`
2. `trace`
3. `area`

Widget config:

1. `kind = resources`
2. `allowMultiple = true`

Persistence direction:

1. use a dedicated links table
2. one record per resource:
   - `entity_container_id`
   - `label`
   - `url`
   - `position`
   - `created_at`

### 4. `entity_rating`

Purpose:

1. score a place with stars
2. create a clean numeric signal for later filtering and ranking

Supported entity types:

1. `pin`

Widget config:

1. `kind = rating`
2. `scale = 5`

Persistence direction:

1. use a dedicated rating record
2. one rating per entity container:
   - `entity_container_id`
   - `value`
   - `updated_at`

### 5. `entity_nearby_pins`

Purpose:

1. show 2-3 nearby pins
2. prefer high-rated nearby pins
3. act as a discovery widget

Supported entity types:

1. `pin`

Widget config:

1. `kind = nearby_pins`
2. `maxItems = 3`
3. optional `minRating`

Read model:

1. input entity must have point geometry
2. query nearest other pins
3. bias or filter by rating
4. return links to the related pins

Persistence direction:

1. no direct authorable table required for v1
2. this is primarily a computed widget

### 6. `entity_transport_mode`

Purpose:

1. describe how a path was traveled
2. present it as icon buttons

Supported entity types:

1. `trace`

Options:

1. `walk`
2. `car`
3. `bus`
4. `tram`
5. `train`
6. `ferry`

Widget config:

1. `kind = transport_mode`
2. `options = [walk, car, bus, tram, train, ferry]`
3. `allowMultiple = false` in v1

Persistence direction:

1. use a dedicated transport metadata record
2. one record per entity container:
   - `entity_container_id`
   - `mode`
   - `updated_at`

## Right shell runtime implications

The right entity shell should expose local runtime channels for entity widgets.

Recommended channels:

1. `entityId`
2. `entityType`
3. `entityDraft`
4. `saving`
5. `deleteWarningOpen`
6. `entityRating`
7. `selectedGalleryAssetId`
8. `selectedStoryId`
9. `transportMode`

## Database direction

These widgets should push the schema toward dedicated enrichment tables rather than expanding legacy `pins` columns.

Recommended future tables:

1. `entity_media_items`
2. `entity_story_entries`
3. `entity_resource_links`
4. `entity_ratings`
5. `entity_transport_modes`

Computed widgets such as `entity_nearby_pins` can stay read-only in v1.

## Implementation order

Recommended order:

1. `entity_rating`
2. `entity_resources`
3. `entity_gallery`
4. `entity_stories`
5. `entity_transport_mode`
6. `entity_nearby_pins`

## Rules

1. do not put these enrichments into one giant `entity_info` widget
2. each widget should stay its own file/module
3. each widget should get its own binding layer when it becomes interactive
4. each widget should fail in isolation inside the right shell
5. each widget should read from normalized entity payload plus its own enrichment source

## TEMP / Tech Debt

1. the current right shell still contains transitional save logic for `entity_info` and `entity_delete`
2. current pin image support is still legacy and should later fold into `entity_gallery`
3. markdown rendering strategy for stories is not selected yet
