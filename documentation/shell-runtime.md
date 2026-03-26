# Shell Runtime

## Purpose

`Shell` is not only a visual container. It is also a local runtime surface for the widgets it hosts.

Each shell instance owns:

- layout and motion
- widget readiness orchestration
- a local runtime state
- a local communication bus for its widgets

This runtime is scoped by `shellId`, not by placement (`left`, `right`, `top`).

## Core Rule

Widgets inside a shell should not communicate by prop-drilling through sibling widgets.

They should communicate through the shell runtime.

## Current v1 Contract

Implemented in:

- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/shells/ShellRuntimeProvider.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/shells/ShellRuntimeProvider.tsx)

The shell runtime currently exposes:

- `shellId`
- `state`
- `setValue(key, value)`
- `patchState(patch)`
- `resetState()`
- `registerScrollContainer(element)`
- `registerWidgetElement(widgetKey, element)`
- `scrollWidgetToCenter(widgetKey)`

This keeps the runtime generic enough for every shell instance while still simple enough to evolve safely.

## First Live Scenario

The first real shell-runtime channel is:

- `shell_search`
  - writes `collectionQuery`
- `shell_collections`
  - reads `collectionQuery`
  - filters visible collections inside the same shell

This proves the architecture on a real widget-to-widget communication path.

## Widget As Instrument

The intended model is not "sidebar sections with props".

The intended model is:

- `widget` = an independent instrument / module
- `shell` = the rack or mixer section that hosts instruments
- `shell runtime` = the local signal bus
- `binding config` = the wiring between a widget and that bus

This means a widget should be portable between shells.

The shell should not need to know the widget's internal business logic.
It should only provide:

- a runtime bus
- placement
- motion/layout orchestration
- binding values

## First Binding-Based Widget

`shell_mode_switch` is the first widget moving toward this model.

Its effective config now describes:

- widget kind: `button_group`
- runtime channel: `interactionMode`
- button values: `pin`, `trace`, `area`
- optional disabled channel: `areasDisabled`

The widget writes only to the shell runtime channel.

Shell-specific side effects such as:

- applying app interaction mode
- clearing selection
- stopping collection editing

are handled by a shell bridge, not by the widget itself.

That is the pattern to extend:

- widget = reusable instrument
- shell bridge = adapter from shell bus to app effects

## Why This Matters

The shell becomes:

- a container
- an orchestrator
- a local bus
- a local state boundary
- a scroll surface
- a reorder surface

Instead of:

- a passive wrapper with prop-drilled children

## Naming

Canonical domain term:

- `collection`

UI aliases like `layer` may still exist temporarily, but the architecture should converge on `collection` as the primary concept.

## Next Steps

After the search/collections channel, more shell-local state can move into runtime:

- active collection
- editing collection
- shell-level selection
- shell commands like `requestClose`
- widget-to-widget events through shell actions

The goal is one shared runtime model for every shell instance, regardless of where that shell is rendered.

## Binding-Driven CTA State

Widget primary actions should be derived from binding/runtime state, not hardcoded in the shell.

Current `shell_collections` rule:

- clean edit + no pending selection -> `Close`
- dirty edit + no pending selection -> `Save`
- clean edit + pending selection -> `Pin` / `Path` / `Zone`
- dirty edit + pending selection -> `Save & Pin` / `Save & Path` / `Save & Zone`

This logic lives in the widget binding layer, so the widget remains reusable and the shell stays orchestration-only.

## Collection Roles

Do not overload one collection id with multiple meanings.

Current split:

- `targetCollectionId`
  - app-level destination for save flows
  - used when geometry or entities need a collection target
- `highlightedCollectionId`
  - shell-level visual selection inside the widget list
  - used only for widget presentation/runtime
- `editingCollectionId`
  - shell-level expanded editor state

This keeps save targeting separate from widget highlighting and avoids accidental UI jumps when a save flow commits.

## Shell-Level Capabilities

Some behaviors belong to the shell itself rather than to any specific widget.

Current shared shell capabilities:

- `scrollWidgetToCenter(widgetKey)`
  - vertical shells can bring a target widget to the center of the visible shell viewport
- widget reordering
  - widgets can be dragged by a shell-level handle in the top slot area
  - the shell owns reorder geometry and persistence
  - widgets remain unaware of drag-and-drop internals
  - the same `ShellWidgetSlot` and shared reorder hook now power both left and right shell surfaces
- interaction lock
  - shell can expose an `interactionLocked` runtime channel during guided authoring flows
  - widgets can stay active or disable themselves based on whether they are essential to completing the current flow

The same shell runtime model now also backs the right entity surface:

- `RightEntityShell`
  - owns shell placement, close behavior, shell-level error isolation, and scroll surface
  - exposes a runtime for entity widgets
  - renders entity widgets through the same slot layer used by the left shell
  - keeps the shell/container concerns separate from the entity widgets themselves

The same shell runtime model now also backs the global widget surfaces:

- `WidgetCenterShell`
  - owns the global widget center surface
  - renders global widgets through the same slot layer and reorder hook used by the other shells
- `WidgetLibraryShell`
  - is a full-screen shell, not a special modal
  - hosts the widget catalog used to add widgets into shells

Current transitional state:

- the right shell now exists as a shell
- entity widgets still keep some local business logic and have not yet been fully moved to a binding layer

That keeps instrument widgets portable:

- widgets render content
- shell provides motion, scroll, ordering, and placement behavior
