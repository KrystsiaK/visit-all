import type { Transition, Variants } from "framer-motion";

export const glassEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const glassDurations = {
  shell: 0.24,
  section: 0.2,
  item: 0.22,
  micro: 0.18,
} as const;

export const glassShellTransition: Transition = {
  duration: glassDurations.shell,
  ease: glassEase,
};

export const glassSectionTransition: Transition = {
  duration: glassDurations.section,
  ease: glassEase,
};

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

