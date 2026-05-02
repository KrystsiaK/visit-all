import type { Transition, Variants } from "framer-motion";

// ─── Animation Types ─────────────────────────────────────────────────────────

/**
 * Preset animation names for glass surfaces.
 * Each preset combines entrance, hover, and exit animations.
 */
export type GlassAnimationPreset =
  | "none"
  | "breathe"      // Subtle padding + border-radius on hover (macOS-style)
  | "fadeUp"       // Fade in from below
  | "scaleIn"      // Scale from center
  | "slideRight"   // Slide from right
  | "slideLeft"    // Slide from left
  | "float"        // Gentle floating motion
  | "press"        // Press/tap interaction;

/**
 * Animation configuration for a single state
 */
export interface GlassAnimationState {
  opacity?: number;
  scale?: number;
  x?: number | string;
  y?: number | string;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  borderRadius?: string;
  padding?: string | number;
  paddingInline?: string | number;
  paddingBlock?: string | number;
  transition?: Transition;
}

/**
 * Complete animation definition with all states
 */
export interface GlassAnimationDefinition {
  /** Initial state before mount */
  initial?: GlassAnimationState;

  /** Animated state after mount */
  animate?: GlassAnimationState;

  /** State on unmount (for AnimatePresence) */
  exit?: GlassAnimationState;

  /** State on hover */
  whileHover?: GlassAnimationState;

  /** State on tap/click */
  whileTap?: GlassAnimationState;

  /** State when dragging */
  whileDrag?: GlassAnimationState;

  /** Inner content container state before mount */
  contentInitial?: GlassAnimationState;

  /** Inner content container animated state after mount */
  contentAnimate?: GlassAnimationState;

  /** Inner content container state on hover */
  contentWhileHover?: GlassAnimationState;

  /** Inner content container state on tap/click */
  contentWhileTap?: GlassAnimationState;

  /** Inner content container state on unmount */
  contentExit?: GlassAnimationState;

  /** Default transition for this animation */
  transition?: Transition;

  /** Custom framer-motion variants (advanced usage) */
  variants?: Variants;
}

/**
 * Animation prop type - can be preset name or full definition
 */
export type GlassAnimation = GlassAnimationPreset | GlassAnimationDefinition;

/**
 * Defines what user interaction should drive the animation preset.
 */
export type GlassAnimationTrigger =
  | "mount"
  | "hover"
  | "tap"
  | "click";
