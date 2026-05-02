import type { GlassAnimationDefinition } from "./types";
import { glassTransitions } from "./transitions";
import { glassRadius } from "../motion";

// ─── Breathe Animation ───────────────────────────────────────────────────────
//
// macOS-style organic hover effect: padding expands, border-radius shifts.
// This creates a "breathing" glass surface that feels alive.
//
// Inspired by: https://codepen.io/lucasromerodb/pen/BaXVbeW

/**
 * Breathe animation - subtle padding and border-radius expansion on hover
 *
 * This is the signature liquid glass hover effect:
 * - Padding increases slightly
 * - Border radius changes organically (using glassRadius flip)
 * - Smooth cubic-bezier with overshoot
 *
 * Perfect for: interactive cards, buttons, menu items
 */
export const breatheAnimation: GlassAnimationDefinition = {
  initial: {
    paddingBlock: "1.5rem",
    paddingInline: "2.5rem",
    borderRadius: "3rem",
  },

  animate: {
    paddingBlock: "1.5rem",
    paddingInline: "2.5rem",
    borderRadius: "3rem",
  },

  contentInitial: {
    borderRadius: "3rem",
  },

  contentAnimate: {
    borderRadius: "3rem",
  },

  whileHover: {
    paddingBlock: "1.8rem",
    paddingInline: "2.8rem",
    borderRadius: "4rem",
    transition: glassTransitions.breathe,
  },

  contentWhileHover: {
    borderRadius: "4rem",
    transition: glassTransitions.breathe,
  },

  whileTap: {
    paddingBlock: "1.42rem",
    paddingInline: "2.42rem",
    borderRadius: "2.8rem",
    transition: glassTransitions.press,
  },

  contentWhileTap: {
    borderRadius: "2.8rem",
    transition: glassTransitions.press,
  },

  transition: glassTransitions.breathe,
};

/**
 * Breathe animation variant for pills (uses full rounded borders)
 */
export const breathePillAnimation: GlassAnimationDefinition = {
  initial: {
    paddingBlock: "0.4rem",
    paddingInline: "0.6rem",
    borderRadius: glassRadius(999),
  },

  animate: {
    paddingBlock: "0.4rem",
    paddingInline: "0.6rem",
    borderRadius: glassRadius(999),
  },

  contentInitial: {
    borderRadius: glassRadius(999),
  },

  contentAnimate: {
    borderRadius: glassRadius(999),
  },

  whileHover: {
    paddingBlock: "0.6rem",
    paddingInline: "0.8rem",
    borderRadius: glassRadius(999, true),
    transition: glassTransitions.breathe,
  },

  contentWhileHover: {
    borderRadius: glassRadius(999, true),
    transition: glassTransitions.breathe,
  },

  whileTap: {
    paddingBlock: "0.35rem",
    paddingInline: "0.55rem",
    borderRadius: glassRadius(999),
    transition: glassTransitions.press,
  },

  contentWhileTap: {
    borderRadius: glassRadius(999),
    transition: glassTransitions.press,
  },

  transition: glassTransitions.breathe,
};

/**
 * Breathe animation variant for controls (smaller scale)
 */
export const breatheControlAnimation: GlassAnimationDefinition = {
  initial: {
    paddingBlock: "0.45rem",
    paddingInline: "0.65rem",
    borderRadius: glassRadius(16),
  },

  animate: {
    paddingBlock: "0.45rem",
    paddingInline: "0.65rem",
    borderRadius: glassRadius(16),
  },

  contentInitial: {
    borderRadius: glassRadius(16),
  },

  contentAnimate: {
    borderRadius: glassRadius(16),
  },

  whileHover: {
    paddingBlock: "0.55rem",
    paddingInline: "0.8rem",
    borderRadius: glassRadius(18, true),
    transition: glassTransitions.breathe,
  },

  contentWhileHover: {
    borderRadius: glassRadius(18, true),
    transition: glassTransitions.breathe,
  },

  whileTap: {
    paddingBlock: "0.4rem",
    paddingInline: "0.6rem",
    borderRadius: glassRadius(15),
    transition: glassTransitions.press,
  },

  contentWhileTap: {
    borderRadius: glassRadius(15),
    transition: glassTransitions.press,
  },

  transition: glassTransitions.breathe,
};
