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
