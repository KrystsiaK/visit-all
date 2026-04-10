import type { Variants } from "framer-motion";
import { glassShellTransition, glassSectionTransition } from "./motion";

/* ── Public types ───────────────────────────────── */

export type ShellEntranceName =
  | "overlay"
  | "slide-left"
  | "slide-right"
  | "slide-top"
  | "slide-bottom";

export interface ShellEntrancePreset {
  shell: Variants;
  section: Variants;
}

/* ── Shared helpers ─────────────────────────────── */

const EXIT_DURATION = 0.16;
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 1, 1];

const makeShellVariants = (
  hidden: { x?: string | number; y?: string | number; opacity: number },
  exit: { x?: string | number; y?: string | number; opacity: number },
): Variants => ({
  hidden,
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
    ...exit,
    transition: { duration: EXIT_DURATION, ease: EXIT_EASE },
  },
});

const makeSectionVariants = (
  hidden: { y?: number; x?: number; opacity: number },
  exit?: { y?: number; x?: number; opacity: number },
): Variants => ({
  hidden,
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: glassSectionTransition,
  },
  ...(exit
    ? { exit: { ...exit, transition: { duration: EXIT_DURATION, ease: "easeOut" } } }
    : {}),
});

/* ── Presets ─────────────────────────────────────── */

export const shellEntrancePresets: Record<ShellEntranceName, ShellEntrancePreset> = {
  overlay: {
    shell: makeShellVariants(
      { opacity: 0, x: 18, y: 18 },
      { opacity: 0, x: 10, y: 10 },
    ),
    section: makeSectionVariants(
      { opacity: 0, y: 14 },
      { opacity: 0, y: 8 },
    ),
  },

  "slide-left": {
    shell: makeShellVariants(
      { opacity: 0, x: "-106%" },
      { opacity: 0, x: "-102%" },
    ),
    section: makeSectionVariants(
      { opacity: 0, x: -20 },
      { opacity: 0, x: -12 },
    ),
  },

  "slide-right": {
    shell: makeShellVariants(
      { opacity: 0, x: "106%" },
      { opacity: 0, x: "102%" },
    ),
    section: makeSectionVariants(
      { opacity: 0, x: 20 },
      { opacity: 0, x: 12 },
    ),
  },

  "slide-top": {
    shell: makeShellVariants(
      { opacity: 0, y: "-106%" },
      { opacity: 0, y: "-102%" },
    ),
    section: makeSectionVariants(
      { opacity: 0, y: -20 },
      { opacity: 0, y: -12 },
    ),
  },

  "slide-bottom": {
    shell: makeShellVariants(
      { opacity: 0, y: "106%" },
      { opacity: 0, y: "102%" },
    ),
    section: makeSectionVariants(
      { opacity: 0, y: 20 },
      { opacity: 0, y: 12 },
    ),
  },
};

/* ── Resolver ───────────────────────────────────── */

export function resolveShellEntrance(
  entrance: ShellEntranceName | undefined,
  shellVariants: Variants | undefined,
  sectionVariants: Variants | undefined,
): ShellEntrancePreset {
  // Explicit custom variants take priority
  if (shellVariants) {
    return {
      shell: shellVariants,
      section: sectionVariants ?? shellEntrancePresets.overlay.section,
    };
  }

  // Named preset
  return shellEntrancePresets[entrance ?? "overlay"];
}

