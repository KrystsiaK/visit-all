# BaseWidget

> AI context file. Read this first when working with BaseWidget.tsx.

## What it is

The universal widget chrome container. Every product widget wraps content inside BaseWidget.

Provides: (1) Identity bar - floating TitlePill or CompactTitlePill straddling the card top edge.
(2) Settings panel - expandable tray with background style picker + custom content + delete button.
(3) Glass card body - rounded, blurred, bordered surface with configurable background tint.

## Props

- title, eyebrow, subtitle (optional strings) - widget identity text
- className, bodyClassName, contentPaddingClassName - styling overrides
- dataTestId - for testing
- children (ReactNode) - widget content
- settingsContent (ReactNode) - custom settings tray content
- accent (ReactNode) - slot above body
- identityVisibility: "inline" (default) or "settings-only"
- backgroundStyle: "default" | "mist" | "cream" | "rose"
- onBackgroundStyleChange - callback for bg picker
- sizeMode: "compact" (default, max-h capped) or "expanded" (no cap)
- draggable (boolean) - when true, adds extra top padding for drag grip icon
- onDelete - callback for delete button (when provided, delete button appears in settings)

## Identity modes

- inline: TitlePill with eyebrow + title + subtitle always visible in utility bar
- settings-only: CompactTitlePill with label; full identity inside settings tray

## Settings panel content order

When settings is open (via gear icon), the panel shows sections in this order:

1. **Identity** (if identityVisibility === "settings-only" && hasIdentity)
2. **Background picker** (if onBackgroundStyleChange provided) - 4 color options
3. **Custom settings** (if settingsContent provided)
4. **Delete button** (if onDelete provided) - red destructive action button

## Pill positioning rules

1. Pill protrudes 50% above the card top edge (centered on border via -translate-y-1/2).
2. Resting width capped at 40% of the card width (max-w-[40%] on wrapper).
3. On hover the wrapper transitions to max-w-full so pill expands but never exceeds card width.
4. Pill wrapper has pointer-events-auto (parent bar is pointer-events-none).

## Layout anatomy

motion.div (layout="position", pt-3.5 when utility bar shows, pt-5 when draggable)
  Utility bar (absolute, inset-x-3, top-3.5, -translate-y-1/2, z-5):
    Left: pill wrapper (max-w-[40%], hover:max-w-full, transition) -> TitlePill or CompactTitlePill
    Right: Settings button (Settings2 icon, pointer-events-auto)
  Card surface (rounded-2xl, glass bg):
    Settings tray (AnimatePresence, animated height/opacity):
      Identity (conditional)
      Background picker (conditional)
      Custom settings (conditional)
      Delete button (conditional)
    Accent slot
    Body (scrollable, no-scrollbar): children

## Dependencies

framer-motion (AnimatePresence, motion.div, layout), lucide-react (Settings2),
TitlePill + CompactTitlePill from ./TitlePill, cn from ../lib/cn

## Consumed by

All app-level widget cards: EntityInfoWidgetCard, EntityGalleryWidgetCard,
EntityStoriesWidgetCard, EntityDeleteWidgetCard, EntityResourcesWidgetCard,
EntityNearbyPinsWidgetCard, EntityPlaceholderWidgetCard, etc.

## Testing

BaseWidget.test.tsx - unit tests for identity/settings rendering.
Storybook: Shell Kit/BaseWidget.
