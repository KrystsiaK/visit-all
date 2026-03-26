import type { Transition, Variants } from "framer-motion";

export const glassEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const glassDurations = {
  shell: 0.52,
  section: 0.28,
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

const sidebarShellTransition: Transition = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1],
};

export const sidebarShellVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "-106%",
    y: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      ...sidebarShellTransition,
      when: "beforeChildren",
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 0,
    x: "-102%",
    y: 0,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const sidebarSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: glassSectionTransition,
  },
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
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    x: 16,
    y: 20,
    transition: {
      duration: 0.24,
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

export const overlayItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: glassSectionTransition,
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.99,
    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },
};
