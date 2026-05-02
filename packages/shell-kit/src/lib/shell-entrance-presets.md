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
