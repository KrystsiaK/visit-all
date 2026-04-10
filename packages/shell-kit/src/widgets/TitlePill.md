# TitlePill & CompactTitlePill

> AI context file — read this first when working with `TitlePill.tsx`.

## What it is

Two floating glass pill components that display widget identity text above a `BaseWidget` card. They sit in the "utility bar" zone, absolutely positioned above the widget chrome.

## Variants

| Component | Purpose | Content |
|---|---|---|
| `TitlePill` | Full identity pill | `eyebrow` · `title` · `subtitle` — all optional, renders `null` when all empty |
| `CompactTitlePill` | Minimal identity pill | `label` (required) + optional `icon` (defaults to a 2×2 Mondrian square) |

## Hover-expand behaviour (Liquid Glass)

Both pills implement a shared **hover-expand** interaction via the `useHoverExpand` hook:

1. **Resting** — `max-width: 100%` (constrained to parent). Text truncated with `…`. Subtle shadow.
2. **Hover** — pill expands up to `PILL_EXPAND_MAX` (480 px) via CSS transition (420 ms, ease-out).
   Simultaneously, framer-motion spring animates `scale` (1.0 → 1.035) and `boxShadow`
   (adds inner white ring + deeper drop shadow). A one-shot shimmer light sweep plays across.
   `border-white/25` + `bg-white/94` + `z-10` to overlap siblings.
3. **Overflow scroll** — if content still overflows at 480 px, two gradient overlay divs
   (`ScrollFades`) smoothly fade in/out via CSS `transition-opacity` (no mask-image flash).
   Content auto-scrolls back and forth with cubic ease-in-out via `requestAnimationFrame`.

### Why NOT mask-image?

CSS `mask-image` is **not animatable** — switching between gradient strings causes an
instant visual blink. Instead, two absolutely-positioned gradient `<div>` overlays are
rendered permanently and their `opacity` is transitioned via CSS `transition-opacity`,
giving a completely smooth fade.

### Internal hook: `useHoverExpand()`

Returns `{ scrollRef, hovered, overflows, fadeLeft, fadeRight, onEnter, onLeave }`.

- `scrollRef` — attach to the scrollable inner `<div>`.
- `fadeLeft` / `fadeRight` — booleans that drive the `ScrollFades` opacity.
- Auto-scroll runs a forward → pause → backward → pause loop while hovered.
- All timers/rAFs are cleaned up on mouse-leave and effect teardown.

### Shimmer component

A `<motion.div>` that plays a single light-sweep across the pill on hover enter.
Uses `AnimatePresence` for smooth enter/exit.

## Props

### TitlePill

```ts
interface TitlePillProps {
  eyebrow?: string;   // UPPERCASE small label
  title?: string;     // Main text, semibold
  subtitle?: string;  // Secondary text, lighter
  className?: string; // Merged onto outer pill div
}
```

### CompactTitlePill

```ts
interface CompactTitlePillProps {
  label: string;      // Required uppercase text
  icon?: ReactNode;   // Replaces default Mondrian square
  className?: string;
}
```

## Visual design tokens

| Token | Resting | Hovered |
|---|---|---|
| Background | `white/80` (`white/82` compact) | `white/94` |
| Border | `black/8` | `white/25` |
| Shadow | `0 1px 3px …, 0 6px 18px …` | `0 2px 6px …, 0 8px 32px …, inset ring` |
| Scale | `1.0` | `1.035` (spring) |
| Backdrop | `blur-xl` | `blur-xl` |

## Where it's used

- **`BaseWidget`** — renders `TitlePill` (inline identity) or `CompactTitlePill`
  (settings-only identity) in the utility bar at `inset-x-3 -top-4`.
- The parent has `pointer-events-none`; the pill adds `pointer-events-auto` so hover works.
- The pill uses `origin-left` so the spring scale anchors from the left edge.

## Dependencies

- `framer-motion` — `AnimatePresence`, `motion.div` (spring scale, shadow, shimmer)
- `cn` (clsx + tailwind-merge) from `../lib/cn`
- `.no-scrollbar` CSS class (from app's `globals.css`, supplemented by inline `scrollbarWidth: "none"`)

## File layout

```
TitlePill.tsx
├── Constants (PILL_EXPAND_MAX, pillSpring, shadow tokens)
├── easeInOutCubic()         — math helper
├── useHoverExpand()         — shared hook (hover + auto-scroll + fade state)
├── hideScrollbar            — inline CSSProperties
├── ScrollFades              — overlay gradient fade divs (left + right)
├── Shimmer                  — one-shot light sweep
├── TitlePill                — exported component
└── CompactTitlePill         — exported component
```

## Testing notes

- Covered indirectly by `BaseWidget.test.tsx`.
- Storybook: `Shell Kit/TitlePill` — includes "Hover Expand · Liquid Glass" demo.
