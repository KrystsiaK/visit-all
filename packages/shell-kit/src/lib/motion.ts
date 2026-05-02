import type { Transition, Variants } from "framer-motion";
import {
  liquidGlassMotion,
  liquidGlassDurations,
  liquidGlassEaseStandard,
} from "@synarava/liquid-glass";

export const glassEase: [number, number, number, number] = liquidGlassEaseStandard;

export const glassDurations = {
  shell: liquidGlassDurations.shell,
  section: liquidGlassDurations.section,
  item: liquidGlassDurations.item,
  micro: liquidGlassDurations.micro,
} as const;

export const glassShellTransition: Transition = liquidGlassMotion.shell;

export const glassSectionTransition: Transition = liquidGlassMotion.section;

export const overlayShellVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 18,
    y: 18,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      ...glassShellTransition,
      when: "beforeChildren",
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 0,
    x: 10,
    y: 10,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const overlaySectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: glassSectionTransition,
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },
};
