# Component Library Workflow

## Principles

1. shared primitives are refined once and reused everywhere
2. widgets own presentation and interaction wiring, not persistence
3. persistence stays in entity enrichment or other data-layer records
4. every important primitive gets three layers of feedback:
   - Storybook for visual states and docs
   - `Vitest` UI tests for interaction and focus behavior
   - `Playwright` for real in-app flows when the primitive is mounted inside shells

## Storybook usage

Storybook is the component-library surface for `visit-all`.

Use it to:

1. inspect visual states of shared components in isolation
2. lock in variants before reusing a primitive across widgets
3. review spacing, typography, and editable states without the whole app shell

Primary commands:

```bash
npm run storybook
npm run build-storybook
```

## Current first-class primitive

`InlineEditableText` is the first primitive with this full workflow:

1. Storybook stories for visual states
2. dedicated UI tests for editing behavior
3. app integration through the entity hero/name widget

`StarRatingInput` is now the second primitive with the same workflow:

1. Storybook stories for states and visual language
2. dedicated UI tests for interaction behavior
3. app integration through `entity_rating`

## Expected quality bar for shared primitives

Before a shared primitive is considered stable:

1. default state is documented in Storybook
2. edge states are documented in Storybook
3. focus, blur, keyboard, and disabled behavior are covered in UI tests
4. if the primitive sits inside a shell or other framework surface, at least one real app flow is covered in `Playwright`

## New widget rule

When building a new widget, follow:

`documentation/widget-implementation-workflow.md`
