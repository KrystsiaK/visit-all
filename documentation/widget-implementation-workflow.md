# Widget Implementation Workflow

## Goal

Make new widgets predictable to build from a single prompt.

The output should not be "a widget plus a few ad-hoc fixes".
It should be one repeatable workflow.

## Rules

1. a widget is presentation and interaction wiring only
2. persistence belongs to an enrichment or other entity data layer
3. shared inputs or controls must become primitives before they spread
4. shell behavior must stay in shells, not leak into widget internals

## Standard flow for a new widget

### 1. Decide the data contract

Before UI work:

1. identify the canonical entity/enrichment record
2. keep the widget independent from storage details
3. define which actions the widget triggers

Examples:

1. `entity_rating` writes to `entity_ratings`
2. `entity_resources` writes to `entity_resource_links`
3. `entity_gallery` writes to `entity_media_items`
4. `entity_stories` writes to `entity_story_entries`
5. `entity_nearby_pins` is computed from nearby active pins + ratings + distance ordering

### 2. Extract shared primitives first

If the widget introduces a reusable input or control:

1. create the primitive in `src/components/inputs/*`
2. use that primitive inside the widget
3. avoid widget-local one-off controls unless the control is truly unique

Examples:

1. `InlineEditableText`
2. `StarRatingInput`

### 3. Mount the primitive into the widget

Then wire the primitive into:

1. the widget card
2. the widget bindings
3. the server actions or data-layer call

The widget should:

1. read normalized entity payload
2. trigger save/update actions
3. stay ignorant of persistence internals

### 4. Cover all quality layers

Every serious widget or primitive should ship with:

1. Storybook states
2. `Vitest` UI tests for the primitive
3. DB tests when a canonical enrichment is involved
4. `Playwright` coverage when the in-app mounted flow is critical

## Checklist

For each new widget:

1. shared primitive extracted if needed
2. Storybook stories added
3. UI tests added
4. DB tests added when persistence changes
5. shell/widget visual language matches the existing system
6. motion feels subordinate to shell motion and uses shared motion tokens
7. decisions and temporary bridges are recorded in `MemPalace`

## Current examples

### Name editing

1. primitive: `InlineEditableText`
2. widget: `EntityInfoWidgetCard`
3. persistence: `entity_details.title`

### Rating

1. primitive: `StarRatingInput`
2. widget: `EntityRatingWidgetCard`
3. persistence: `entity_ratings`

### Notes

1. primitive: notes-manager UI inside `EntityStoriesWidgetCard`
2. widget: `EntityStoriesWidgetCard`
3. persistence: `entity_story_entries`
