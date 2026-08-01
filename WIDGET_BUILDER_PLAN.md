# Widget Builder — Implementation Plan

## Status: COMPLETE — ready for end-to-end test

### Progress
- [x] Step 1 — Package scaffold `@synarava/widget-generator` ✓
- [x] Step 2 — System prompt ✓ (production-quality prompt with few-shot examples in `../synarava-widget-generator/src/prompt.ts`)
- [x] Step 3 — API route `/api/widget-builder` ✓ (`src/app/api/widget-builder/route.ts`)
- [x] Step 4 — executor.ts ✓ (Babel standalone + sandboxed `new Function()` in `../synarava-widget-generator/src/executor.ts`, wired into `WidgetPreviewSandbox.tsx`)
- [x] Step 5 — Widget Builder UI ✓ (`src/modules/widget-builder/`)
- [x] Step 6 — Widget Center rework ✓ (Create Widget AI button + library button in `WidgetPanel.tsx`)
- [x] Step 7 — DB + persistence ✓ (`db/migrations/015_generated_widgets.sql` + `saveGeneratedWidget` / `getGeneratedWidgets` / `archiveGeneratedWidget` in `actions.ts`)
- [x] Step 8 — Publish `@synarava/widget-generator@0.1.0` and replace the internal workspace package ✓

### To run
1. Set `ANTHROPIC_API_KEY` in `.env.local`
2. `npm run db:migrate` to apply migration 015
3. `npm run dev`, open the app, click ✦ Create Widget with AI in Widget Center
4. Try the seed prompts (countdown, weather, rating, note widget)

This document covers two things:
1. Rework of the Widget Center panel (pool view)
2. New AI Widget Builder — full-width shell with chat interface

---

## 1. What's Wrong Now

**Widget Center (`WidgetPanel.tsx`)**
- Two sequential DB calls on every open → slow
- Library is a static catalog — you can only pick from pre-built widgets
- No interactive preview of widgets before placing
- The "Add Widget" button opens a flat grid with no identity

**Root cause**: Widget Center was built as a management panel, not a creation tool.

---

## 2. Target Architecture

```
Widget Center (right sidebar — existing slot)
├── Widget Pool — active widgets, each interactive + placement selector
│   └── [widget live preview] [host dropdown] [remove]
├── ─────────────────────────────────────
└── [✦ Create Widget]  ← opens Widget Builder Shell

Widget Builder Shell (NEW — full-width top overlay, z-[120])
├── Left: AI Chat
│   ├── User describes desired widget
│   ├── Claude generates WidgetDefinition + JSX component
│   ├── Iterations: "make it show X", "add a rating", etc.
│   └── [Accept → add to pool]  [Keep refining]
└── Right: Live Preview Sandbox
    ├── Renders the generated component in real time
    ├── Fully interactive (can click, scroll, etc.)
    └── Shows placement info and port declarations
```

---

## 3. Package: `@synarava/widget-generator`

Source lives in `../synarava-widget-generator/`; consumers install the exact published version from GitHub Packages. Follows the same independent-release pattern as `wiring-engine`.

**Why a package:**
- Reusable by any app built on the framework
- No Next.js dependency; browser-only execution is isolated behind the `/executor` entry point
- Clear input/output contract
- Separate testable unit

**What it owns:**
```
../synarava-widget-generator/
  src/
    index.ts
    generator.ts          ← Claude API call + prompt engineering
    prompt.ts             ← system prompt that enforces WidgetDefinition contract
    executor.ts           ← Babel-standalone transpile + sandboxed eval
    types.ts              ← GenerationRequest, GenerationResult
    catalog-context.ts    ← builds AI context from @synarava/ui-kit COMPONENT_CATALOG
  package.json            ← deps: @anthropic-ai/sdk, @babel/standalone
```

**Dependencies:**
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.104.1",
    "@babel/standalone": "^7.29.7"
  },
  "peerDependencies": {
    "@synarava/ui-kit": "0.1.1",
    "@synarava/wiring-engine": "0.2.0"
  }
}
```

### 3.1 generator.ts — Contract

```ts
export interface GenerationRequest {
  userMessage: string;
  history: ChatMessage[];
  componentCatalog: ComponentEntry[];    // from @synarava/ui-kit COMPONENT_CATALOG
  widgetDefinitionContract: string;      // TypeScript interface as string
}

export interface GenerationResult {
  code: string;                  // full JSX component code
  widgetDefinition: {
    key: string;
    name: string;
    description: string;
    ports: PortDefinition[];
  };
  explanation: string;           // AI's explanation for the chat
  rawMessage: string;
}

export async function generateWidget(
  request: GenerationRequest,
  apiKey: string
): Promise<GenerationResult>
```

### 3.2 System Prompt (Key Constraints)

The AI must:
1. Use only components from `COMPONENT_CATALOG` (no arbitrary HTML)
2. Wrap output in `BaseWidget` from `@synarava/shell-kit`
3. Declare ports via `defineWidget` contract
4. Export exactly one component as default
5. Use Tailwind classes matching the design system
6. Keep components stateless where possible — state via `usePortConsumer`/`usePortPublisher`

Example response format:
```
<widget_definition>
{ "key": "weather_widget", "name": "Weather", "ports": [...] }
</widget_definition>

<component_code>
"use client";
import { BaseWidget } from "@synarava/shell-kit";
import { StarRatingInput } from "@synarava/ui-kit";

export default function WeatherWidget() {
  return (
    <BaseWidget eyebrow="Weather" title="Today">
      ...
    </BaseWidget>
  );
}
</component_code>

<explanation>
I created a weather widget that shows...
</explanation>
```

### 3.3 executor.ts — Runtime Rendering

```ts
import * as Babel from "@babel/standalone";

export function compileAndRender(
  code: string,
  availableImports: Record<string, unknown>
): React.ComponentType | null
```

- Transpiles JSX → JS via Babel standalone (runs in browser, no build step)
- Executes in a sandboxed `new Function()` with controlled import scope
- `availableImports` contains `@synarava/ui-kit`, `@synarava/shell-kit`, `react` exports
- Persisted widgets using the retired `@synarava/ui` id are resolved through a
  sandbox-only compatibility alias to `@synarava/ui-kit`; new code must not emit it.
- On error: returns null with error details

---

## 4. App Module: `src/modules/widget-builder/`

```
src/modules/widget-builder/
  WidgetBuilderShell.tsx        ← the full-width overlay shell
  WidgetBuilderChat.tsx         ← chat UI (messages, input, send)
  WidgetPreviewSandbox.tsx      ← live iframe-like render area
  useWidgetBuilderSession.ts    ← chat session state + calls to @synarava/widget-generator
  types.ts
```

### 4.1 WidgetBuilderShell — Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✦ Widget Builder          [close ×]                                │
├─────────────────────────┬───────────────────────────────────────────┤
│  CHAT                   │  LIVE PREVIEW                             │
│                         │                                           │
│  [AI messages]          │  ┌─────────────────────┐                 │
│  [User messages]        │  │  WeatherWidget       │                 │
│                         │  │  (fully interactive) │                 │
│                         │  └─────────────────────┘                 │
│                         │                                           │
│                         │  Ports declared:                          │
│                         │  › query_out → string                    │
│                         │                                           │
│  [text input ──── Send] │  [✓ Accept Widget]  [↺ Keep Refining]   │
└─────────────────────────┴───────────────────────────────────────────┘
```

- Full viewport width (`fixed inset-0 z-[120]`)
- Split 40/60 on desktop, stacked on mobile
- Shell uses `BaseShell` from `@synarava/shell-kit` with `{...SHELL_GLASS}`
- Opened by "Create Widget" button in Widget Center

### 4.2 useWidgetBuilderSession — State

```ts
interface WidgetBuilderSession {
  messages: ChatMessage[];
  currentCode: string | null;
  currentDefinition: WidgetDefinition | null;
  generating: boolean;
  error: string | null;
  send: (message: string) => Promise<void>;
  accept: () => void;        // adds to pool and closes
  reset: () => void;
}
```

---

## 5. Rework Widget Center Pool

**Current problem**: widgets load slowly because of two sequential DB calls on open.

**Fix:**
1. Preload widget data in `ShellBootstrapProvider` alongside shell snapshot — single call
2. Pass `widgets` directly to `WidgetPanel` as prop (already loaded)
3. Remove `bootstrapWidgetLibraryState` from the open handler

**Pool card rework — each widget shows:**
```
┌─────────────────────────────────────────┐
│  [Live widget preview — interactive]    │
│                                         │
│  Nearby Pins                            │
│  Shell: [Left Sidebar ▾]               │  ← dropdown disabled if fixed
│                              [Remove]   │
└─────────────────────────────────────────┘
```

- Widget renders as its actual Component (not a static card)
- Placement dropdown uses `getWidgetPlacementPolicy` — disabled when `required_fixed`
- Remove button calls existing `handleRemoveWidget`

---

## 6. API Route: `/api/widget-builder`

The Claude API key must stay server-side. The generation call goes through a Next.js Route Handler:

```
src/app/api/widget-builder/route.ts

POST /api/widget-builder
Body: { messages: ChatMessage[], context: GenerationContext }
Response: streaming SSE (text delta chunks)
```

Uses `@anthropic-ai/sdk` with streaming. The `../synarava-widget-generator/generator.ts` is called from the route handler only — never from the browser.

---

## 7. Integration with Existing Widget System

When user accepts a generated widget:
1. `useWidgetBuilderSession.accept()` calls a new server action `saveGeneratedWidget(definition, code)`
2. Server stores the component code in DB (new table `generated_widget_components`)
3. Widget is registered in the pool via existing `addWidgetFromLibrary` mechanism
4. The component code is loaded dynamically at runtime via the executor

Generated widgets participate in WiringEngine exactly like hand-written ones:
- They have `WidgetDefinition` with declared ports
- They can be connected via `SystemBinding`
- They show up in the Patch Bay devtool

---

## 8. Build Order

### Step 1 — Package scaffold
- Create `../synarava-widget-generator/` with `package.json`, `tsconfig.json`
- Add to root `package.json` workspaces, `tsconfig.json` paths
- Implement `types.ts`, `catalog-context.ts`

### Step 2 — System prompt + generator
- Write `prompt.ts` with WidgetDefinition contract + COMPONENT_CATALOG context
- Implement `generator.ts` calling Claude claude-sonnet-4-6
- Write unit tests for prompt parsing

### Step 3 — API route
- `src/app/api/widget-builder/route.ts` — streaming SSE
- Auth guard (must be logged in)

### Step 4 — executor.ts
- Babel standalone transpile
- Sandboxed eval with controlled imports
- Error boundary in WidgetPreviewSandbox

### Step 5 — Widget Builder UI
- `WidgetBuilderShell.tsx` layout
- `WidgetBuilderChat.tsx` with streaming message rendering
- `WidgetPreviewSandbox.tsx` with error boundary
- `useWidgetBuilderSession.ts` wiring it all together

### Step 6 — Widget Center rework
- Move preload to `ShellBootstrapProvider`
- Rework pool cards to interactive previews
- Replace static "Add Widget" with "Create Widget" button
- Wire "Create Widget" → open WidgetBuilderShell

### Step 7 — DB + persistence
- Migration: `generated_widget_components` table
- Server action: `saveGeneratedWidget`
- Dynamic component loading at runtime

---

## 9. What the Bot Needs

The AI generator has access to:

**From `@synarava/ui-kit`:**
- `COMPONENT_CATALOG` — all available UI primitives with usage examples
- TypeScript interfaces for each component (exported props types)

**From `@synarava/wiring-engine`:**
- `WidgetDefinition` interface
- `PortDefinition` interface
- `defineWidget` signature

**From `@synarava/shell-kit`:**
- `BaseWidget` props
- `WidgetChromeBackgroundStyle` values

**System prompt gives the bot:**
- The WidgetDefinition contract
- Available import paths
- Design system constraints (Tailwind classes, Mondrian palette)
- Example of a well-formed widget

This is why `COMPONENT_CATALOG` in `@synarava/ui-kit` and the exported types in `@synarava/wiring-engine` matter — they are the bot's API surface.

---

## 10. Open Questions

1. **Code persistence**: store raw JSX string in DB or compiled JS? → Raw JSX, compile at load time via executor
2. **Security**: `new Function()` with sandboxed imports is sufficient for internal tool; add CSP if exposing to untrusted users
3. **Versioning**: what happens when `@synarava/ui-kit` changes? Generated widgets reference specific component APIs — need migration strategy
4. **Storybook**: generated widgets should auto-generate stories for review
