import type { GlassAnimationDefinition } from "./types";
import { glassTransitions } from "./transitions";

// ─── Press Animation ─────────────────────────────────────────────────────────

export const pressAnimation: GlassAnimationDefinition = {
  whileTap: {
    scale: 0.97,
    transition: glassTransitions.press,
  },

  whileHover: {
    scale: 1.02,
    transition: glassTransitions.hover,
  },

  transition: glassTransitions.standard,
};
