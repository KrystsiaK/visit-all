#!/usr/bin/env python3
"""Generate AI context .md files for every shell-kit source module."""
import pathlib

BASE = pathlib.Path(__file__).resolve().parent.parent / "packages" / "shell-kit" / "src"

FILES = {}

FILES["widgets/BaseWidget.md"] = """\
# BaseWidget

> AI context file. Read this first when working with BaseWidget.tsx.

## What it is

The universal widget chrome container. Every product widget wraps content inside BaseWidget.

Provides: (1) Identity bar - floating TitlePill or CompactTitlePill above the card.
(2) Settings panel - expandable tray with background style picker + custom content.
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

## Identity modes

- inline: TitlePill with eyebrow + title + subtitle always visible in utility bar
- settings-only: CompactTitlePill with label; full identity inside settings tray

## Layout anatomy

motion.div (layout="position", pt-5 when utility bar shows)
  Utility bar (absolute, z-3, inset-x-3, -top-4):
    Left: TitlePill or CompactTitlePill
    Right: Settings button (Settings2 icon)
  Card surface (rounded-2xl, glass bg):
    Settings tray (AnimatePresence, animated height/opacity)
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
"""

FILES["widgets/WidgetContext.md"] = """\
# WidgetContext (WidgetProvider + useWidgetContext)

> AI context file. Read this first when working with WidgetContext.tsx.

## What it is

A React context that passes widget host information down to widgets.
Widgets use this to know which shell they live in and offer a host-change dropdown.

## Exports

- WidgetProvider - context provider component
- useWidgetContext() - returns context value or null
- WidgetHostOption - { value: string; label: string }
- WidgetContextValue - full context shape

## WidgetContextValue shape

- currentHost?: string - current shell host identifier
- hostOptions?: WidgetHostOption[] - available host targets
- hostSelectionDisabled?: boolean - hide host picker
- onHostChange?: (host: string) => void - callback when user changes host

## Usage pattern

WidgetProvider wraps a group of widgets inside a shell.
Individual widgets call useWidgetContext() to read host info.
Returns null when outside a provider (safe to check).

## Dependencies

React only (createContext, useContext).
"""

FILES["shells/BaseShell.md"] = """\
# BaseShell

> AI context file. Read this first when working with BaseShell.tsx.

## What it is

The generic animated panel shell. All concrete shells (Left, Right Entity, Widget Center,
Widget Library, User Shell, Top Chrome) compose BaseShell with specific placement,
sizing, and entrance presets.

BaseShell knows: open/close, placement, motion, backdrop, scroll region, header region.
BaseShell does NOT know: pins, paths, collections, ratings, map logic, product semantics.

## Props

- isOpen, onClose - panel visibility
- title, subtitle - header text
- closeLabel, backdropCloseLabel - a11y labels
- closeButton (ReactNode) - custom close button (default: X circle)
- children - panel body content
- scrollContainerRef, scrollContainerDataId - scroll container registration
- headerMeta (ReactNode) - extra header content below subtitle
- shellStyle (CSSProperties), shellClassName - outer shell styling
- backdropClassName, surfaceClassName, headerClassName, bodyClassName, contentContainerClassName
- mobileHandle (bool, default true) - pill-shaped drag handle on mobile
- showBackdrop, showHeader, showCloseButton - visibility toggles
- entrance (ShellEntranceName) - named animation preset (overlay, slide-left, etc.)
- shellVariants, sectionVariants (framer Variants) - custom motion overrides
- shellInitial, shellAnimate, shellExit - variant state names

## Layout anatomy

AnimatePresence
  Backdrop button (optional, mobile-only by default)
  Shell container (motion.div with entrance variants):
    Surface div:
      Content container (flex col):
        Mobile handle (optional)
        Header (glass card with title + subtitle + close button)
        Body (scrollable, gap-3, children go here)

## Entrance animation

Uses resolveShellEntrance() to pick shell + section Variants.
Named presets: overlay, slide-left, slide-right, slide-top, slide-bottom.
Custom variants override named presets.

## Dependencies

framer-motion (AnimatePresence, motion), resolveShellEntrance from ../lib/shell-entrance-presets.

## Consumed by

ShellSurface in the app layer, which adds Tooltip close buttons and more.
All concrete shells go through ShellSurface -> BaseShell.
"""

FILES["shells/ShellRuntime.md"] = """\
# ShellRuntime (ShellRuntimeProvider + hooks)

> AI context file. Read this first when working with ShellRuntime.tsx.

## What it is

A React context that provides shared mutable state for a shell instance.
Every concrete shell wraps its content in ShellRuntimeProvider.
Widgets and shell internals use hooks to read/write shell-level state.

## Exports

- ShellRuntimeProvider - context provider (shellId + initialState)
- useShellRuntime<TState>() - throws if outside provider
- useOptionalShellRuntime<TState>() - returns null if outside provider
- useShellRuntimeValue(key, fallback) - read a single state key
- useShellRuntimeActions<TState>() - only mutation methods (no shellId/state)
- useOptionalShellRuntimeActions<TState>() - nullable version
- ShellRuntimeState = Record<string, unknown>
- TypedShellRuntime<TState> - full runtime shape
- ShellRuntimeActions<TState> - action-only shape

## TypedShellRuntime shape

- shellId: string
- state: TState
- setValue(key, value) - set single key (skips if same reference)
- patchState(patch) - merge partial state (skips if all keys same)
- resetState() - restore initialState
- registerScrollContainer(element) - store scroll container ref
- getScrollContainer() - retrieve scroll container element
- registerWidgetElement(widgetKey, element) - register widget DOM node
- scrollWidgetToCenter(widgetKey) - smooth-scroll widget into view center

## State management

Uses useState internally. setValue and patchState both bail out (return same
reference) when values have not changed, preventing unnecessary re-renders.

## Scroll management

- registerScrollContainer / getScrollContainer: used by BaseShell body and
  useShellWidgetReorder for auto-scroll during drag.
- registerWidgetElement / scrollWidgetToCenter: used to scroll a specific
  widget into the visible center of the shell panel.

## Dependencies

React only (createContext, useContext, useState, useCallback, useMemo, useRef).
"""

FILES["shells/ShellSlot.md"] = """\
# ShellSlot

> AI context file. Read this first when working with ShellSlot.tsx.

## What it is

A drag-reorderable wrapper slot for a single widget inside a shell panel.
Renders a grip handle, drop indicators, and a glowing drag-active effect.

## Props

- children (ReactNode) - the widget content
- isDragging (bool) - whether this slot is currently being dragged
- isDropTarget (bool) - whether another widget is hovering over this slot
- dropEdge ("before" | "after" | null) - which edge the drop indicator shows on
- onDragStart, onDragEnd, onDragOver, onDrop - HTML drag event handlers

## Visual states

Resting: grip handle hidden (shown on group-hover via CSS).
Dragging (isDragging=true):
  - z-10, scale 1.01, opacity 0.9
  - Animated glow overlay (gold/blue gradient shimmer, pulsing box-shadow)
  - Sweeping light streak animation
Drop target: blue 2px indicator line appears at before or after edge.

## Reorder enabled

Reorder is enabled only when ALL four drag handlers are provided.
When enabled, a GripHorizontal icon appears centered above the widget.

## Dependencies

framer-motion (motion.div for glow/shimmer), lucide-react (GripHorizontal), cn.
"""

FILES["shells/shell-widget-order.md"] = """\
# shell-widget-order

> AI context file. Read this first when working with shell-widget-order.ts.

## What it is

Pure utility module for reordering widgets within a shell. No React, no side effects.

## Exports

- ShellWidgetLike - interface { id: string; position: number }
- ShellDropEdge - "before" | "after"
- moveShellWidget<T>(widgets, draggedId, targetId, edge) -> T[]

## moveShellWidget logic

1. Returns same array reference if draggedId === targetId or either not found.
2. Removes dragged widget from array.
3. Inserts at target index (before or after), adjusting for removal offset.
4. Re-indexes all position fields (0-based sequential).

## Dependencies

None. Pure TypeScript.
"""

FILES["shells/useShellWidgetReorder.md"] = """\
# useShellWidgetReorder

> AI context file. Read this first when working with useShellWidgetReorder.ts.

## What it is

A React hook that wires up HTML5 drag-and-drop for reordering widgets in a shell.
Handles drag state, drop target tracking, auto-scroll near edges, and commits
the reorder via moveShellWidget.

## Parameters

- shellId?: string - for scroll container lookup fallback
- widgets: T[] (extends ShellWidgetLike) - current widget list
- onReorder?: (nextWidgets: T[]) => void - called with reordered array

## Returns

- draggedWidgetId: string | null
- dropTarget: { widgetId, edge } | null
- handleDragStart(event, widgetId)
- handleDragEnd()
- handleDragOver(event, widgetId)
- handleDrop(event, widgetId)

## Auto-scroll

Two strategies combined (picks whichever has higher velocity):
1. Edge proximity: pointer near top/bottom of scroll container (88px threshold).
2. Widget reveal: target widget partially hidden by container edge (72px margin).

Uses requestAnimationFrame loop, max speed 22px/frame.

## Scroll container resolution

1. First tries ShellRuntime getScrollContainer() (via useOptionalShellRuntimeActions).
2. Falls back to DOM query: [data-shell-scroll-container="{shellId}"].

## Exported helpers

- getAutoScrollVelocity({ pointerY, containerTop, containerBottom }) -> number
- getWidgetHoverScrollVelocity({ targetTop/Bottom, containerTop/Bottom, edge }) -> number

Both are exported for unit testing.

## Dependencies

React (useCallback, useRef, useState, DragEvent), ShellRuntime hooks, moveShellWidget.
"""

FILES["lib/cn.md"] = """\
# cn

> AI context file. Read this first when working with cn.ts.

## What it is

Tailwind CSS class merge utility. Combines clsx (conditional class joining)
with tailwind-merge (deduplication of conflicting Tailwind classes).

## Signature

cn(...inputs: ClassValue[]): string

## Dependencies

clsx, tailwind-merge.
"""

FILES["lib/motion.md"] = """\
# motion

> AI context file. Read this first when working with motion.ts.

## What it is

Shared motion design tokens for the glass UI system. Defines easing curves,
durations, and default shell/section animation variants.

## Exports

- glassEase: [0.22, 1, 0.36, 1] - cubic-bezier for glass animations
- glassDurations: { shell: 0.24, section: 0.2, item: 0.22, micro: 0.18 }
- glassShellTransition - { duration: 0.24, ease: glassEase }
- glassSectionTransition - { duration: 0.2, ease: glassEase }
- overlayShellVariants - default shell Variants (hidden/visible/exit)
- overlaySectionVariants - default section Variants (hidden/visible/exit)

## Motion language

Enter: fade + translate (18px diagonal for shells, 14px vertical for sections).
Exit: faster (0.16s), accelerating ease [0.4, 0, 1, 1].
Stagger: 20ms between children, no delay.

## Dependencies

framer-motion types only (Transition, Variants).
"""

FILES["lib/shell-entrance-presets.md"] = """\
# shell-entrance-presets

> AI context file. Read this first when working with shell-entrance-presets.ts.

## What it is

Named animation presets for shell enter/exit transitions. Each preset defines
shell-level and section-level framer-motion Variants.

## Exports

- ShellEntranceName: "overlay" | "slide-left" | "slide-right" | "slide-top" | "slide-bottom"
- ShellEntrancePreset: { shell: Variants; section: Variants }
- shellEntrancePresets: Record<ShellEntranceName, ShellEntrancePreset>
- resolveShellEntrance(entrance?, shellVariants?, sectionVariants?) -> ShellEntrancePreset

## Presets

overlay: shell enters from opacity 0, x+18, y+18. Section from opacity 0, y+14.
slide-left: shell from x -106%. Section from x -20.
slide-right: shell from x +106%. Section from x +20.
slide-top: shell from y -106%. Section from y -20.
slide-bottom: shell from y +106%. Section from y +20.

Exit is always fast (0.16s) with accelerating ease.

## resolveShellEntrance logic

1. If custom shellVariants provided: use them + (sectionVariants or overlay fallback).
2. Otherwise: use named preset (default: "overlay").

## Dependencies

framer-motion types, glassShellTransition + glassSectionTransition from ./motion.
"""

if __name__ == "__main__":
    for rel_path, content in FILES.items():
        path = BASE / rel_path
        path.write_text(content)
        print(f"Created {path}")
    print(f"\nDone. {len(FILES)} files created.")

