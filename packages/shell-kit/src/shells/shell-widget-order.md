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
