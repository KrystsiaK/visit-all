import type { GlassAnimationDefinition } from "./types";
import { glassTransitions } from "./transitions";

export const fadeUpAnimation: GlassAnimationDefinition = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 10,
  },
  transition: glassTransitions.standard,
};

export const scaleInAnimation: GlassAnimationDefinition = {
  initial: {
    opacity: 0,
    scale: 0.94,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
  },
  transition: glassTransitions.standard,
};

export const slideRightAnimation: GlassAnimationDefinition = {
  initial: {
    opacity: 0,
    x: -24,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -14,
  },
  transition: glassTransitions.standard,
};

export const slideLeftAnimation: GlassAnimationDefinition = {
  initial: {
    opacity: 0,
    x: 24,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 14,
  },
  transition: glassTransitions.standard,
};

export const floatAnimation: GlassAnimationDefinition = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.985,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  whileHover: {
    y: -2,
    scale: 1.018,
    transition: glassTransitions.float,
  },
  whileTap: {
    scale: 0.99,
    transition: glassTransitions.press,
  },
  transition: glassTransitions.float,
};
