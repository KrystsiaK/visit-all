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
