import type { Transition } from "framer-motion";

// ─── Glass Motion Constants ──────────────────────────────────────────────────

/**
 * Easing curves optimized for glass UI
 */
export const glassEasing = {
  /** Standard ease for most animations */
  standard: [0.22, 1, 0.36, 1] as [number, number, number, number],

  /** Exit animations (faster out) */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],

  /** Hover state transitions */
  hover: [0.25, 0.9, 0.3, 1] as [number, number, number, number],

  /** Organic breathing effect */
  breathe: [0.175, 0.885, 0.32, 2.2] as [number, number, number, number],
} as const;

/**
 * Duration presets for different animation types
 */
export const glassDurations = {
  /** Large containers (shells, modals) */
  shell: 0.26,

  /** Medium sections (cards, panels) */
  section: 0.22,

  /** Small items (buttons, pills) */
  item: 0.2,

  /** Micro-interactions */
  micro: 0.18,

  /** Press/tap feedback */
  press: 0.14,

  /** Floating animations */
  float: 0.32,

  /** Breathing hover effect */
  breathe: 0.4,

  /** Shimmer effects */
  shimmer: 0.46,
} as const;

// ─── Transition Presets ──────────────────────────────────────────────────────

/**
 * Standard glass transition for most animations
 */
export const glassTransition: Transition = {
  duration: glassDurations.section,
  ease: glassEasing.standard,
};

/**
 * Shell-level transition (slightly slower)
 */
export const glassShellTransition: Transition = {
  duration: glassDurations.shell,
  ease: glassEasing.standard,
};

/**
 * Item-level transition (faster)
 */
export const glassItemTransition: Transition = {
  duration: glassDurations.item,
  ease: glassEasing.standard,
};

/**
 * Press interaction (spring-based)
 */
export const glassPressTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.78,
};

/**
 * Float effect (gentle spring)
 */
export const glassFloatTransition: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 26,
  mass: 0.92,
};

/**
 * Hover state transition
 */
export const glassHoverTransition: Transition = {
  duration: glassDurations.float,
  ease: glassEasing.hover,
};

/**
 * Breathing hover effect (macOS-style)
 */
export const glassBreatheTransition: Transition = {
  duration: glassDurations.breathe,
  ease: glassEasing.breathe,
};

/**
 * Exit animation transition
 */
export const glassExitTransition: Transition = {
  duration: 0.16,
  ease: glassEasing.exit,
};

/**
 * All transitions combined for easy import
 */
export const glassTransitions = {
  standard: glassTransition,
  shell: glassShellTransition,
  item: glassItemTransition,
  press: glassPressTransition,
  float: glassFloatTransition,
  hover: glassHoverTransition,
  breathe: glassBreatheTransition,
  exit: glassExitTransition,
} as const;
