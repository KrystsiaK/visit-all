---
name: framework-vision
description: Long-term goal — reusable multi-app framework with widget pool, AI widget generation, and canonical package pyramid
metadata:
  type: project
---

The end goal is a framework others (and the owner) can use to build panel-based apps with signal-driven widgets.

**Why:** Visit All should not be the only app. The framework should be reusable across mobile, desktop, and web.

**Canonical package pyramid (bottom to top):**
1. `@synarava/liquid-glass` — visual materials (published, stable)
2. `@synarava/shell-kit` — BaseShell, BaseWidget, ShellSlot (published; needs migration to use wiring-engine bus)
3. `@synarava/wiring-engine` — Zustand signal bus + WiringConfig + WidgetDefinition contract (published package, pinned by the app)
4. App widgets + shells (app-specific, implement WidgetDefinition)
5. `@synarava/widget-generator` — published generation contracts and browser executor; emits WidgetDefinition-conformant components

**The missing piece today: WidgetDefinition contract**
Every widget (human or AI-generated) must implement:
```ts
interface WidgetDefinition {
  key: string
  name: string
  ports: PortDefinition[]
  Component: React.ComponentType
  configSchema?: JSONSchema
  defaultConfig?: Record<string, unknown>
}
```
This belongs in `@synarava/wiring-engine` (same conceptual space as ports/signals).
`defineWidget()` helper validates and registers the contract.

**AI generation path:**
User describes intent → AI generates WidgetDefinition → defineWidget() validates
→ WidgetRegistry.register() → works in any framework-based app without code changes

**How to apply:** Before adding new packages or abstractions, check if they fit the pyramid.
WidgetDefinition and defineWidget() are the next concrete additions needed.

**Next steps (priority order):**
1. Remove `"use client"` from wiring-engine src/ (cross-platform blocker)
2. Add WidgetDefinition + defineWidget() to wiring-engine
3. Add WidgetRegistry to wiring-engine
4. Keep @synarava/wiring-engine releases independent from the consumer app
5. Migrate shell-kit to use wiring-engine bus (new shell-kit version)
6. Migrate Visit All app from ShellRuntimeProvider → WiringEngineProvider
7. Evolve the published AI widget generation pipeline through explicit package releases

See also: [[wiring-engine-package]], [[widget-generator-package]], FRAMEWORK_BLUEPRINT.md sections 19-21
