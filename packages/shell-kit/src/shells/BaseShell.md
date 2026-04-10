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
