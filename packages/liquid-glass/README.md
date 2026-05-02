# @synarava/liquid-glass

Shared material and motion system for Synarava UI.

This package exists so shell, widget, and control surfaces can draw from one
visual language instead of manually repeating blur, shadow, border, and motion
tokens in multiple packages.

## What it provides

- liquid-glass surface variants for shells, widgets, pills, controls, and insets
- shared tone system (`neutral`, `mist`, `cream`, `rose`)
- motion tokens tuned for premium, quiet, placement-driven UI
- a small `LiquidGlassSurface` wrapper for Storybook, shells, and widgets

## Design intent

The system is informed by:

- Apple HIG motion guidance: continuity, hierarchy, and restrained motion
- modern glass/material systems where translucency is layered and functional,
  not decorative

The goal is not "maximum blur". The goal is:

1. calm surfaces
2. controlled depth
3. readable edges
4. motion that supports structure

## Usage

```tsx
import {
  LiquidGlassSurface,
  getLiquidGlassClassName,
  liquidGlassMotion,
} from "@synarava/liquid-glass";
```
