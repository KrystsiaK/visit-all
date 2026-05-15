"use client";

import type { CSSProperties } from "react";

import { LiquidGlassSurface, type LiquidGlassSurfaceProps } from "./LiquidGlassSurface";
import { clampTransparency, type LiquidGlassTone } from "./shared";

const stainedToneColor: Record<LiquidGlassTone, string> = {
  neutral: "#d8d9df",
  mist: "#8fcfff",
  cream: "#ffe35c",
  rose: "#ff8fb1",
};

export interface StainedGlassSurfaceProps
  extends Omit<LiquidGlassSurfaceProps, "variant" | "materialStyle"> {
  tintStrength?: number;
  blurPx?: number;
  convexity?: number;
  borderGlow?: number;
  cameOpacity?: number;
  grain?: number;
}

function clampUnit(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

function buildStainedMaterialStyle(
  tone: LiquidGlassTone,
  transparency: number,
  tintStrength: number,
  blurPx: number,
  convexity: number,
  borderGlow: number,
  cameOpacity: number,
  grain: number,
): CSSProperties {
  const toneColor = stainedToneColor[tone];
  const resolvedTransparency = clampTransparency(transparency);
  const resolvedTintStrength = clampUnit(tintStrength, 0.82);
  const resolvedConvexity = clampUnit(convexity, 0.76);
  const resolvedBorderGlow = clampUnit(borderGlow, 0.72);
  const resolvedCameOpacity = clampUnit(cameOpacity, 0.52);
  const resolvedGrain = clampUnit(grain, 0.62);

  const milkOpacity = 0.6 - resolvedTransparency * 0.28;
  const tintOpacity = 0.38 + resolvedTintStrength * 0.46;
  const edgeWhite = 0.24 + resolvedConvexity * 0.24;
  const innerShadow = 0.24 + resolvedConvexity * 0.24;
  const glowOpacity = 0.18 + resolvedBorderGlow * 0.2;
  const saturate = 138 + resolvedTintStrength * 24;
  const blur = Math.max(0, blurPx);

  return {
    background: [
      `radial-gradient(120% 85% at 50% -6%, rgba(255,255,255,${0.22 + resolvedConvexity * 0.18}), rgba(255,255,255,0) 42%)`,
      `radial-gradient(110% 100% at 50% 112%, rgba(255,255,255,${0.08 + resolvedConvexity * 0.08}), rgba(255,255,255,0) 56%)`,
      `repeating-radial-gradient(circle at 18% 26%, rgba(255,255,255,${0.08 * resolvedGrain}) 0 5px, rgba(255,255,255,0) 6px 17px)`,
      `repeating-radial-gradient(circle at 72% 62%, rgba(0,0,0,${0.05 * resolvedGrain}) 0 4px, rgba(0,0,0,0) 5px 15px)`,
      `linear-gradient(180deg, rgba(255,255,255,${Math.min(0.88, milkOpacity + 0.08)}) 0%, rgba(255,255,255,${milkOpacity}) 100%)`,
      `color-mix(in srgb, ${toneColor} ${Math.round(tintOpacity * 100)}%, transparent)`,
    ].join(", "),
    backdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
    boxShadow: [
      `inset 0 0 0 1px rgba(18,16,15,${0.28 + resolvedCameOpacity * 0.24})`,
      `inset 0 0 0 1px rgba(255,255,255,${edgeWhite})`,
      `inset 0 1px 0 rgba(255,255,255,${0.58 + resolvedConvexity * 0.08})`,
      `inset 0 -10px 20px rgba(255,255,255,${0.06 + resolvedConvexity * 0.06})`,
      `inset 0 -2px 10px rgba(0,0,0,${innerShadow})`,
      `inset 0 0 18px rgba(0,0,0,${0.06 + resolvedGrain * 0.04})`,
      `0 16px 40px rgba(0,0,0,${0.08 + resolvedTintStrength * 0.06})`,
      `0 0 0 1px color-mix(in srgb, ${toneColor} ${Math.round(glowOpacity * 100)}%, rgba(255,255,255,0.8))`,
      `0 8px 24px color-mix(in srgb, ${toneColor} ${Math.round(glowOpacity * 100)}%, transparent)`,
    ].join(", "),
  };
}

export function StainedGlassSurface({
  tone = "cream",
  transparency = 0.08,
  tintStrength = 0.82,
  blurPx = 7,
  convexity = 0.76,
  borderGlow = 0.72,
  cameOpacity = 0.52,
  grain = 0.62,
  effect = "amplified",
  children,
  ...props
}: StainedGlassSurfaceProps) {
  const materialStyle = buildStainedMaterialStyle(
    tone,
    transparency,
    tintStrength,
    blurPx,
    convexity,
    borderGlow,
    cameOpacity,
    grain,
  );

  return (
    <LiquidGlassSurface
      {...props}
      variant="widget"
      tone={tone}
      effect={effect}
      transparency={transparency}
      materialStyle={materialStyle}
    >
      {children}
    </LiquidGlassSurface>
  );
}
