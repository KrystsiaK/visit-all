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
