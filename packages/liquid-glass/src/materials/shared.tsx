"use client";

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export type LiquidGlassSurfaceVariant =
  | "shell"
  | "shellStrong"
  | "widget"
  | "pill"
  | "titlePill"
  | "control"
  | "inset";

export type LiquidGlassTone = "neutral" | "mist" | "cream" | "rose";
export type LiquidGlassEffect = "default" | "amplified";

export function clampTransparency(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(0.95, Math.max(0, value));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const glassToneColor: Record<LiquidGlassTone, string> = {
  neutral: "#c0c0c2",
  mist: "#8fc8f0",
  cream: "#f0d87a",
  rose: "#f0a0bc",
};

type GlassConfig = {
  blur: number;
  saturate: number;
  bgAlpha: number;
  reflexLight: number;
  reflexDark: number;
  dropBlur: number;
  dropAlpha: number;
};

const glassConfigs: Record<LiquidGlassSurfaceVariant, GlassConfig> = {
  shell: {
    blur: 22, saturate: 135, bgAlpha: 3,
    reflexLight: 0.9, reflexDark: 0.7,
    dropBlur: 52, dropAlpha: 7,
  },
  shellStrong: {
    blur: 26, saturate: 150, bgAlpha: 4,
    reflexLight: 1.0, reflexDark: 0.9,
    dropBlur: 72, dropAlpha: 9,
  },
  widget: {
    blur: 22, saturate: 135, bgAlpha: 2.5,
    reflexLight: 0.8, reflexDark: 0.6,
    dropBlur: 34, dropAlpha: 6,
  },
  pill: {
    blur: 14, saturate: 140, bgAlpha: 1.5,
    reflexLight: 0.85, reflexDark: 0.45,
    dropBlur: 14, dropAlpha: 5,
  },
  titlePill: {
    blur: 16, saturate: 154, bgAlpha: 0.42,
    reflexLight: 0.96, reflexDark: 0.46,
    dropBlur: 20, dropAlpha: 5.5,
  },
  control: {
    blur: 18, saturate: 145, bgAlpha: 5,
    reflexLight: 1.0, reflexDark: 0.65,
    dropBlur: 24, dropAlpha: 6.5,
  },
  inset: {
    blur: 12, saturate: 128, bgAlpha: 7,
    reflexLight: 0.65, reflexDark: 0.5,
    dropBlur: 18, dropAlpha: 5,
  },
};

function buildBoxShadow(
  rl: number,
  rd: number,
  dropBlur: number,
  dropAlpha: number,
  transparency = 0,
  accentColor?: string,
): string {
  const t = clampTransparency(transparency);
  const lightScale = 1 - t * 0.42;
  const darkScale = 1 - t * 0.34;
  const dropScale = 1 - t * 0.4;
  const l = (p: number) =>
    `color-mix(in srgb, white ${Math.round(rl * p * lightScale)}%, transparent)`;
  const d = (p: number) =>
    `color-mix(in srgb, black ${Math.round(rd * p * darkScale)}%, transparent)`;
  const accent1 = accentColor
    ? `inset 1px 1px 0 color-mix(in srgb, ${accentColor} ${Math.round(20 * lightScale)}%, transparent)`
    : null;
  const accent2 = accentColor
    ? `inset -1px -1px 0 color-mix(in srgb, ${accentColor} ${Math.round(12 * lightScale)}%, transparent)`
    : null;

  return [
    `inset 0 0 0 1px ${l(10)}`,
    `inset 1.8px 3px 0 -2px ${l(90)}`,
    `inset -1.5px -1.5px 0 -1px ${l(80)}`,
    `inset -2px -6px 1px -5px ${l(60)}`,
    `inset -0.3px -1px 4px 0 ${d(12)}`,
    `inset -1.5px 2.5px 0 -2px ${d(20)}`,
    `inset 0 3px 4px -2px ${d(20)}`,
    `inset 2px -6.5px 1px -4px ${d(10)}`,
    accent1,
    accent2,
    `0 4px ${dropBlur}px color-mix(in srgb, black ${Math.round(dropAlpha * dropScale)}%, transparent)`,
  ].filter(Boolean).join(", ");
}

export function buildGlassStyle(
  variant: LiquidGlassSurfaceVariant,
  tone: LiquidGlassTone,
  effect: LiquidGlassEffect,
  transparency = 0,
  shineIntensity = 1,
): CSSProperties {
  const cfg = glassConfigs[variant];
  const glassColor = glassToneColor[tone];
  const amp = effect === "amplified";
  const resolvedTransparency = clampTransparency(transparency);
  const resolvedShineIntensity = Math.max(0, shineIntensity);

  const blur = amp ? cfg.blur + 6 : cfg.blur;
  const saturate = amp ? cfg.saturate + 15 : cfg.saturate;
  const rl = (amp ? cfg.reflexLight * 1.15 : cfg.reflexLight) * resolvedShineIntensity;
  const rd = (amp ? cfg.reflexDark * 1.15 : cfg.reflexDark) * resolvedShineIntensity;

  const transparencyScale = Math.pow(1 - resolvedTransparency, 1.8);
  const bgAlpha = (amp ? cfg.bgAlpha * 1.4 : cfg.bgAlpha) * transparencyScale;
  const visibleBlur = Math.max(6, blur * (1 - resolvedTransparency * 0.25));
  const visibleSaturate = Math.max(100, saturate - resolvedTransparency * 20);

  return {
    backgroundColor: `color-mix(in srgb, ${glassColor} ${Math.max(0.1, bgAlpha)}%, transparent)`,
    backdropFilter: `blur(${visibleBlur}px) url(#lg-refract) saturate(${visibleSaturate}%)`,
    WebkitBackdropFilter: `blur(${visibleBlur}px) saturate(${visibleSaturate}%)`,
    boxShadow: buildBoxShadow(rl, rd, cfg.dropBlur, cfg.dropAlpha, resolvedTransparency),
    transition:
      "background-color 300ms cubic-bezier(1,0,0.4,1), backdrop-filter 300ms cubic-bezier(1,0,0.4,1), -webkit-backdrop-filter 300ms cubic-bezier(1,0,0.4,1), box-shadow 300ms cubic-bezier(1,0,0.4,1), transform 300ms cubic-bezier(1,0,0.4,1)",
  };
}

const baseSurfaceClassName = "relative isolate overflow-hidden";

export function getLiquidGlassClassName(
  _variant: LiquidGlassSurfaceVariant,
  tone: LiquidGlassTone = "neutral",
  effectOrClassName?: LiquidGlassEffect | string,
  className?: string,
): string {
  void tone;
  const resolvedClassName =
    effectOrClassName === "default" || effectOrClassName === "amplified"
      ? className
      : effectOrClassName;

  return cn(baseSurfaceClassName, resolvedClassName);
}

export const liquidGlassSurfaceVariants: Record<LiquidGlassSurfaceVariant, string> = {
  shell: "",
  shellStrong: "",
  widget: "",
  pill: "",
  titlePill: "",
  control: "",
  inset: "",
};

export const liquidGlassToneClasses: Record<LiquidGlassTone, string> = {
  neutral: "",
  mist: "",
  cream: "",
  rose: "",
};

export function LiquidGlassVariantOverlays({
  variant,
  effect,
  transparency,
}: {
  variant: LiquidGlassSurfaceVariant;
  effect: LiquidGlassEffect;
  transparency: number;
}) {
  if (variant !== "titlePill") {
    return null;
  }

  const amplified = effect === "amplified";
  const t = clampTransparency(transparency);
  const opacityScale = 0.82 + t * 0.48;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: amplified
            ? "radial-gradient(84% 28% at 50% 1%, rgba(255,255,255,0.1), rgba(255,255,255,0.012) 42%, rgba(255,255,255,0) 76%)"
            : "radial-gradient(80% 24% at 50% 1%, rgba(255,255,255,0.052), rgba(255,255,255,0.008) 40%, rgba(255,255,255,0) 74%)",
          opacity: (amplified ? 0.34 : 0.18) * opacityScale,
          transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[1.5%] top-[24%] z-0 h-[42%] w-[14%] rounded-full"
        style={{
          opacity: (amplified ? 0.42 : 0.22) * opacityScale,
          transform: amplified ? "translateX(5px) scale(1.04,1)" : "scale(0.92,0.88)",
          transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)",
          background:
            "linear-gradient(90deg, rgba(255,77,67,0.3), rgba(255,224,77,0.16) 38%, rgba(0,71,255,0.2) 100%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[2%] top-[25%] z-0 h-[38%] w-[12%] rounded-full"
        style={{
          opacity: (amplified ? 0.22 : 0.1) * opacityScale,
          transform: amplified ? "translateX(-5px) scale(1.02)" : "scale(0.92)",
          transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)",
          background:
            "radial-gradient(circle at 54% 50%, rgba(69,126,255,0.16), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0) 72%)",
          filter: "blur(18px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[10%] top-[9%] z-0 h-px"
        style={{
          opacity: (amplified ? 0.58 : 0.32) * opacityScale,
          transform: amplified ? "scaleX(1.03)" : "scaleX(0.92)",
          transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
        }}
      />
    </>
  );
}
