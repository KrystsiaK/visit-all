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
