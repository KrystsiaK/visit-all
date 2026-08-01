---
name: wiring-engine-package
description: @synarava/wiring-engine published package — Zustand bus, architecture decisions, release status
metadata:
  type: project
---

`@synarava/wiring-engine` is published independently from `/Users/kirylkrystsia/WebstormProjects/synarava-wiring-engine`; `visit-all` consumes an exact registry version.

**What it contains:**
- `src/bus/` — Zustand signal bus (createSignalBus, SignalBusProvider, useSignalValue, useSignalActions, useAllSignals)
- `src/core/` — pure types (PortDefinition, SystemBinding, WiringConfig) + WIDGET_PORT_REGISTRY, SYSTEM_BINDINGS
- `src/react/` — WiringEngineProvider (wraps bus + wiring config), usePortEmitter, usePortConsumer
- `__stories__/` — interactive Patch Bay demo in Storybook (React Flow, shows the signal bus visually)

**Key decisions:**
- Zustand replaces shell-kit's custom ShellRuntime (useState + context). Shell-kit is no longer a dependency.
- One aggregate bus output (bundle_out) → Selector nodes pick one channel → consumers get one value. MapAdapter gets full bundle.
- "use client" still in src/ files — needs removal before publishing (Next.js specific, harmless in RN but wrong in library)

**Publish status:** Not yet published. Ready after removing "use client" from src/ files.

**Dependencies:** zustand + react only. Fully cross-platform.

**How to apply:** See [[framework-vision]] for where this fits in the pyramid.
WidgetDefinition + defineWidget() need to be added here before publish.
