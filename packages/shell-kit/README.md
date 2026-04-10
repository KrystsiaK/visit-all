# @synarava/shell-kit

Self-contained Shell & Widget UI component library.  
Product-agnostic — zero imports outside this package.

## Install

```bash
# As an npm workspace (monorepo)
# In root package.json: "workspaces": ["packages/*"]
npm install
```

## Usage

```tsx
import {
  BaseShell,
  BaseWidget,
  ShellRuntimeProvider,
  ShellSlot,
  WidgetProvider,
  useShellRuntime,
  useShellWidgetReorder,
} from "@synarava/shell-kit";
```

## Atoms

| Atom | Purpose |
|------|---------|
| `BaseShell` | Panel container — open/close, backdrop, motion, scroll, header. Accepts a `closeButton` render slot. |
| `ShellRuntimeProvider` | Shell-scoped signal bus. Generic: `ShellRuntimeProvider<TState>` for typed state. |
| `ShellSlot` | Widget position — drag handle, drop indicator, reorder geometry. |
| `useShellWidgetReorder` | Canonical drag & reorder hook with auto-scroll. |
| `moveShellWidget` | Pure reorder algorithm. |
| `BaseWidget` | Widget chrome — title, settings panel, background style picker. |
| `WidgetProvider` | Shell-owned widget host context. |

## Mental model

```
BaseShell       = panel / rack
BaseWidget      = instrument
ShellRuntime    = shared signals / wires
ShellSlot       = widget position inside the panel
WidgetProvider  = shell-owned widget context
```

The **application** is the orchestrator.

## Typed runtime

```tsx
interface MySidebarState extends ShellRuntimeState {
  searchQuery: string;
  filterActive: boolean;
}

<ShellRuntimeProvider<MySidebarState>
  shellId="sidebar"
  initialState={{ searchQuery: "", filterActive: false }}
>
  ...
</ShellRuntimeProvider>

const { state, setValue } = useShellRuntime<MySidebarState>();
state.searchQuery;              // string ✓
setValue("filterActive", true);  // type-safe ✓
```

## Peer dependencies

| Package | Version |
|---------|---------|
| `react` | ≥ 18 |
| `react-dom` | ≥ 18 |
| `framer-motion` | ≥ 11 |
| `lucide-react` | ≥ 0.300 |
| `clsx` | ≥ 2 |
| `tailwind-merge` | ≥ 2 |
| Tailwind CSS | ≥ 4 (implicit) |

## Development

```bash
# Run library tests
cd packages/shell-kit
npx vitest run                              # unit tests
npx vitest run --config vitest.ui.config.ts # UI tests
npx eslint src/                             # lint

# From root
npm run test -w @synarava/shell-kit
```

## Architecture rule

Every import inside `src/` must be either:
1. A peer dependency (`react`, `framer-motion`, etc.)
2. A relative path within the package

No `@/`, no `next`, no host-project modules. Enforced by ESLint.

