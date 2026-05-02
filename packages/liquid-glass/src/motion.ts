import type { Transition } from "framer-motion";

// ─── Organic border-radius ────────────────────────────────────────────────────
//
// Alternating corner radii give glass a living, organic feel.
// On hover, corners flip — the shape subtly breathes.
//
// Usage:
//   style={{ borderRadius: glassRadius(28) }}
//   whileHover={{ borderRadius: glassRadius(28, true) }}

export function glassRadius(base: number, flipped = false): string {
  const a = base;
  const b = Math.round(base * 0.961);
  return flipped
    ? `${b}px ${a}px ${b}px ${a}px`
    : `${a}px ${b}px ${a}px ${b}px`;
}

// ─── Background drift animation ───────────────────────────────────────────────
//
// Slow background-position drift that makes glass surfaces feel alive
// because the backdrop content changes → self-displacement warps differently.
//
// Inject once, then use class: [animation:lg-drift_60s_ease-in-out_infinite_alternate]

export const liquidGlassDriftKeyframes = `
@keyframes lg-drift {
  0%   { background-position: 50% 50%; }
  25%  { background-position: 60% 40%; }
  50%  { background-position: 40% 60%; }
  75%  { background-position: 55% 45%; }
  100% { background-position: 50% 50%; }
}`;

export function injectDriftKeyframes(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("lg-drift-keyframes")) return;
  const style = document.createElement("style");
  style.id = "lg-drift-keyframes";
  style.textContent = liquidGlassDriftKeyframes;
  document.head.appendChild(style);
}

export const liquidGlassEaseStandard: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const liquidGlassEaseExit: [number, number, number, number] = [0.4, 0, 1, 1];
export const liquidGlassEaseHover: [number, number, number, number] = [0.175, 0.885, 0.32, 2.2];

export const liquidGlassDurations = {
  shell: 0.26,
  section: 0.22,
  item: 0.2,
  micro: 0.18,
  press: 0.14,
  float: 0.4,
  shimmer: 0.46,
} as const;

export const liquidGlassShellTransition: Transition = {
  duration: liquidGlassDurations.shell,
  ease: liquidGlassEaseStandard,
};

export const liquidGlassSectionTransition: Transition = {
  duration: liquidGlassDurations.section,
  ease: liquidGlassEaseStandard,
};

export const liquidGlassPressTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.78,
};

export const liquidGlassFloatTransition: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 26,
  mass: 0.92,
};

export const liquidGlassHoverTransition: Transition = {
  duration: liquidGlassDurations.float,
  ease: liquidGlassEaseHover,
};

export const liquidGlassShimmerTransition: Transition = {
  duration: liquidGlassDurations.shimmer,
  ease: liquidGlassEaseStandard,
};

export const liquidGlassMotion = {
  shell: liquidGlassShellTransition,
  section: liquidGlassSectionTransition,
  press: liquidGlassPressTransition,
  hover: liquidGlassHoverTransition,
  float: liquidGlassFloatTransition,
  shimmer: liquidGlassShimmerTransition,
  exit: {
    duration: 0.16,
    ease: liquidGlassEaseExit,
  } satisfies Transition,
} as const;
