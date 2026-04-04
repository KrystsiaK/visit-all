# Optimistic UI Architecture

## Goal

The UI must react immediately.

Database writes stay authoritative, but they must not block the first visual response.

The rule is:

1. User acts.
2. UI changes immediately.
3. Save happens in the background.
4. Canonical state reconciles with the server result.

## Core Model

There are only three layers:

1. `canonical state`
   This is the data loaded from the database.

2. `optimistic commands`
   These are temporary local patches created immediately after user intent.

3. `display state`
   This is what shells and widgets actually render.
   It is computed as:

`display state = canonical state + optimistic commands`

## Why

Without this split, every action feels slow because the UI waits for:

1. server action
2. database write
3. re-fetch
4. re-render

That makes the interface feel broken even when the data model is correct.

## What belongs in optimistic commands

Only fast interaction state:

- move widget between shells
- reorder widgets inside a shell
- add widget to shell
- remove widget from shell
- local visible ordering changes

Not everything should be optimistic by default.
Large destructive mutations can still use explicit confirmation and then reconcile.

## App-Level Orchestrator

The optimistic layer must be controlled in one place at the application level.

Current intended owner:

- `/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx`

That owner is responsible for:

- storing optimistic commands
- deriving display state
- passing display state into shells
- triggering background persistence
- clearing or rolling back optimistic commands

## Current First Slice

The first optimistic slice is only:

1. `move entity widget between right pin shell and left shell`
2. `reorder widgets inside a shell`

This is enough to remove the worst perceived lag and prove the model.

## Data Shape

### Canonical

- left shell widgets from `getLeftSidebarShellWidgets()`
- right entity widgets from `getEntityWidgets(entityType, entityId)`

### Optimistic

Each move is stored as a temporary command:

```ts
type OptimisticEntityWidgetMove = {
  widgetId: string;
  entityId: string;
  entityType: "pin" | "trace" | "area";
  targetHost: "left_sidebar" | "pin_entity_shell" | "trace_entity_shell" | "area_entity_shell";
  widgetSnapshot: WidgetInstanceRecord;
  createdAt: number;
};
```

## Derivation Rules

### Left shell display

- start from canonical left shell widgets
- remove entity widgets that have an optimistic move away from `left_sidebar`
- append optimistic moved-in entity widgets targeting `left_sidebar`
- never duplicate widgets already present canonically

### Right entity shell display

- start from canonical entity shell widgets
- remove widgets that have an optimistic move away from the current entity shell
- append optimistic moved-in entity widgets targeting the current entity shell
- never duplicate widgets already present canonically

## Lifecycle of a Move

### Example: move from right pin shell to left shell

1. User selects `Left Shell` in widget settings.
2. App-level orchestrator creates optimistic command.
3. Right shell immediately hides the widget.
4. Left shell immediately shows the widget.
5. Server action persists placement move.
6. Canonical refresh runs.
7. If canonical state matches optimistic target, optimistic command is cleared.
8. If persistence fails, optimistic command is rolled back.

## Failure Rule

If the server write fails:

1. remove the optimistic command
2. render canonical state again
3. show local error

The UI must never get stuck in a phantom state.

## Architectural Rule

Shells and widgets do not decide ownership by themselves.

They render only what the display state tells them.

That means:

- widgets do not own placement truth
- individual shells do not invent host logic
- the app-level orchestrator is the only place that merges canonical and optimistic state

## Implementation Rule

Keep the merge logic pure and isolated.

Use pure helpers for:

- `buildLeftShellDisplayWidgets(...)`
- `buildEntityShellDisplayWidgets(...)`
- `reconcileOptimisticMoves(...)`

That keeps the runtime understandable and testable.

## Long-Term Path

Once this pattern is stable, the same mechanism should drive:

- widget center add/remove
- library add-to-shell
- cross-shell wanderer moves
- drag reorder for every shell

## One Sentence Summary

The database remains the source of truth, but the UI must render from a local optimistic scene graph first and reconcile with the database second.
