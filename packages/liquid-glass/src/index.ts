export {
  LiquidGlassSurface,
  TintedGlassSurface,
  StainedGlassSurface,
  getLiquidGlassClassName,
  liquidGlassSurfaceVariants,
  liquidGlassToneClasses,
  type LiquidGlassSurfaceVariant,
  type LiquidGlassTone,
  type LiquidGlassEffect,
  type LiquidGlassSurfaceProps,
  type TintedGlassSurfaceProps,
  type StainedGlassSurfaceProps,
} from "./materials";
export { GlassInput, type GlassInputProps } from "./GlassInput";
export { GlassFilterDefs } from "./GlassFilterDefs";
export {
  GlassPill,
  GlassPillFrame,
  GlassOverflowFades,
  type GlassPillFrameProps,
} from "./GlassPillFrame";
export { GlassControl, type GlassControlProps } from "./GlassControl";

// Legacy motion exports (kept for backward compatibility)
export {
  liquidGlassMotion,
  liquidGlassDurations,
  liquidGlassEaseStandard,
  liquidGlassEaseExit,
  liquidGlassEaseHover,
  liquidGlassPressTransition,
  liquidGlassShellTransition,
  liquidGlassSectionTransition,
  liquidGlassFloatTransition,
  liquidGlassHoverTransition,
  liquidGlassShimmerTransition,
  glassRadius,
  liquidGlassDriftKeyframes,
  injectDriftKeyframes,
} from "./motion";

// New animation system exports
export {
  // Types
  type GlassAnimationPreset,
  type GlassAnimationState,
  type GlassAnimationDefinition,
  type GlassAnimation,
  type GlassAnimationTrigger,

  // Transitions
  glassEasing,
  glassDurations,
  glassTransition,
  glassTransitions,

  // Presets
  glassAnimationPresets,
  glassAnimationVariants,
  resolveGlassAnimation,

  // Individual animations
  breatheAnimation,
  breathePillAnimation,
  breatheControlAnimation,
  fadeUpAnimation,
  scaleInAnimation,
  slideRightAnimation,
  slideLeftAnimation,
  floatAnimation,
  pressAnimation,
} from "./animations";
