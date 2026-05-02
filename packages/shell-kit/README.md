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
  DockedShell,
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
| `DockedShell` | Ergonomic left/right edge shell built on `BaseShell`. Use when a product shell just needs placement, width, pinned content, and children. |
| `ShellRuntimeProvider` | Shell-scoped signal bus. Generic: `ShellRuntimeProvider<TState>` for typed state. |
| `ShellSlot` | Widget position — drag handle, drop indicator, reorder geometry. |
| `useShellWidgetReorder` | Canonical drag & reorder hook with auto-scroll. |
| `moveShellWidget` | Pure reorder algorithm. |
| `BaseWidget` | Widget chrome — title, settings panel, background style picker. |
| `WidgetProvider` | Shell-owned widget host context. |

## Mental model

```
BaseShell       = low-level panel primitive
DockedShell     = ergonomic edge-docked shell
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

## Recommended product usage

When building a left or right app shell:

1. prefer `DockedShell`
2. use `BaseShell` only when the shell is materially different (`top chrome`, fullscreen library, floating special case)
3. let shell-kit own pinned-versus-scroll layout rhythm
4. keep product shells thin by binding runtime state, title, pinned content, and widget host only
