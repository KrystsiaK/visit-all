# Strict Lego Architecture

## Principle

The application must behave like Lego.

There is always:

1. one smallest reusable atom
2. one strict composition path above it
3. customization through configuration and bindings
4. no parallel "similar" implementations

If two things look the same but are implemented differently, the architecture is already drifting.

Canonical framework entrypoint:

`src/framework`

## Atomic Layers

The UI stack must be built from these layers only.

### 1. `ShellRuntime`

This is the bus.

Responsibilities:

1. local shell-scoped state
2. local shell-scoped actions
3. shell scroll registration
4. widget element registration
5. shell capabilities API

There must be only one runtime model for all shells.

Current atom:

`src/components/shells/ShellRuntimeProvider.tsx`

Canonical framework export:

`src/framework/shells/ShellRuntime.tsx`

### 2. `ShellSurface`

This is the base shell container.

Responsibilities:

1. placement
2. open / close
3. backdrop
4. shell motion
5. shell scroll surface
6. shell header region

Concrete shells must be thin specializations of one shell surface pattern.

Current shell family:

1. `src/components/shells/TopChromeShell.tsx`
2. `src/components/shells/LeftSidebarShell.tsx`
3. `src/components/shells/RightEntityShell.tsx`
4. `src/components/shells/WidgetCenterShell.tsx`
5. `src/components/shells/WidgetLibraryShell.tsx`

Canonical framework export:

`src/framework/shells/BaseShell.tsx`

### 3. `ShellWidgetSlot`

This is the base host for any widget inside a shell.

Responsibilities:

1. drag affordance
2. reorder geometry
3. drop target state
4. dragging visual state
5. shell-owned widget framing behavior

There must be only one slot component.

Current atom:

`src/components/shells/ShellWidgetSlot.tsx`

Canonical framework export:

`src/framework/shells/ShellSlot.tsx`

### 4. `WidgetChrome`

This is the base widget component.

Responsibilities:

1. neutral widget header
2. settings trigger
3. expanding settings section
4. host selector
5. compatibility wrapper for older widget bodies

There must be only one widget chrome model.

Current atom:

`src/components/widgets/WidgetChrome.tsx`

Canonical framework export:

`src/framework/widgets/BaseWidget.tsx`

### 4.1 `WidgetChromeProvider`

Shell-owned widget chrome state must be provided from one context layer.

Responsibilities:

1. current widget host
2. allowed host options
3. whether host selection is locked
4. optional host mutation callback

Widgets must not hardcode these props one-by-one.
Shells provide them once, and `WidgetChrome` resolves them from context.

Current atom:

`src/components/widgets/WidgetChromeContext.tsx`

Canonical framework export:

`src/framework/widgets/WidgetContext.tsx`

### 5. `WidgetFrame`

This is not a parallel base component anymore.

It must remain only a thin compatibility wrapper over `WidgetChrome`.

Current atom:

`src/components/widgets/WidgetFrame.tsx`

### 6. `WidgetHost`

This is the canonical placement model.

Responsibilities:

1. where a widget currently lives
2. where it is allowed to live
3. whether host selection is mutable

There must be only one host vocabulary.

Current atom:

`src/lib/widget-hosts.ts`

## Composition Rules

These rules are strict.

### Widget rule

A widget must not invent its own:

1. outer card system
2. settings panel pattern
3. host selector model
4. drag layer

A widget may only provide:

1. content
2. config
3. bindings
4. optional settings body content

Shell-owned host state must arrive through `WidgetChromeProvider`, not through repeated local props in each widget file.

### Shell rule

A shell must not invent its own:

1. runtime model
2. drag and reorder model
3. slot rendering model
4. widget error isolation model

A shell may only provide:

1. placement preset
2. motion preset
3. shell title / header content
4. shell-specific orchestration

### Widget library rule

If a widget is not yet placed into a real host shell, it lives in:

`widget_library`

The widget library is not a special modal world.
It is a shell.

## Current Violations

There are no major known structure-level violations left in the shell/widget framework path.

Remaining work is now mostly feature depth, richer cross-shell placement, and data-model completion rather than parallel UI architecture.

## Refactor Order

To keep the architecture strict, refactoring must follow this order:

1. introduce or refine the atom
2. move one family to that atom
3. delete the parallel implementation
4. document the new canonical path

Never:

1. create a second base component "for now"
2. keep two different shell surface patterns alive
3. keep two different widget chrome patterns alive

## Target End State

The final shape should be:

1. `ShellRuntime`
2. `ShellSurface`
3. `ShellWidgetSlot`
4. `WidgetChrome`
5. widget-specific content and bindings

Everything else should be a specialization, never a separate architecture.
