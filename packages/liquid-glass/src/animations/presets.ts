import type { GlassAnimationPreset, GlassAnimationDefinition } from "./types";
import { breatheAnimation, breathePillAnimation, breatheControlAnimation } from "./breathe";
import { fadeUpAnimation, scaleInAnimation, slideRightAnimation, slideLeftAnimation, floatAnimation } from "./entrance";
import { pressAnimation } from "./press";

// ─── Preset Registry ─────────────────────────────────────────────────────────

/**
 * All available animation presets.
 *
 * Usage:
 * ```tsx
 * <LiquidGlassSurface animation="breathe">
 *   Content
 * </LiquidGlassSurface>
 * ```
 */
export const glassAnimationPresets: Record<GlassAnimationPreset, GlassAnimationDefinition | null> = {
  none: null,
  breathe: breatheAnimation,
  fadeUp: fadeUpAnimation,
  scaleIn: scaleInAnimation,
  slideRight: slideRightAnimation,
  slideLeft: slideLeftAnimation,
  float: floatAnimation,
  press: pressAnimation,
} as const;

/**
 * Variant-specific breathe animations
 */
export const glassAnimationVariants = {
  breathePill: breathePillAnimation,
  breatheControl: breatheControlAnimation,
} as const;

/**
 * Resolve animation preset to definition
 */
export function resolveGlassAnimation(
  animation: GlassAnimationPreset | GlassAnimationDefinition | undefined,
): GlassAnimationDefinition | null {
  if (!animation || animation === "none") {
    return null;
  }

  if (typeof animation === "string") {
    return glassAnimationPresets[animation] ?? null;
  }

  return animation;
}
