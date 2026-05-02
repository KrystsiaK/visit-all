"use client";

import type { CSSProperties } from "react";

import { LiquidGlassSurface, type LiquidGlassSurfaceProps } from "./LiquidGlassSurface";
import { clampTransparency, type LiquidGlassTone } from "./shared";

const tintedSurfaceToneColor: Record<LiquidGlassTone, string> = {
  neutral: "#d6d8df",
  mist: "#9fd4ff",
  cream: "#ffd76f",
  rose: "#ffb6c6",
};

export interface TintedGlassSurfaceProps
  extends Omit<LiquidGlassSurfaceProps, "variant" | "materialStyle"> {
  tintStrength?: number;
  blurPx?: number;
  shineIntensity?: number;
}

function clampUnit(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

function buildTintedMaterialStyle(
  tone: LiquidGlassTone,
  transparency: number,
  tintStrength: number,
  blurPx: number,
  shineIntensity: number,
): CSSProperties {
  const toneColor = tintedSurfaceToneColor[tone];
  const resolvedTransparency = clampTransparency(transparency);
  const resolvedTintStrength = clampUnit(tintStrength, 0.5);
  const resolvedShine = clampUnit(shineIntensity, 0.7);

  const tintOpacity = 0.12 + resolvedTintStrength * 0.58;
  const milkOpacity = 0.86 - resolvedTransparency * 0.62;
  const topGlowOpacity =
    (0.12 + resolvedTintStrength * 0.34) * (1 - resolvedTransparency * 0.72);
  const edgeOpacity = 0.08 + resolvedTintStrength * 0.28;
  const shadowOpacity = 0.05 + resolvedTintStrength * 0.12;
  const saturate = 118 + resolvedTintStrength * 42;
  const clearShadowOpacity = 0.12 + resolvedTransparency * 0.12;
  const resolvedBlur = Math.max(0, blurPx);

  return {
    background: [
      `radial-gradient(120% 90% at 8% 0%, rgba(255,255,255,${topGlowOpacity}), rgba(255,255,255,0) 42%)`,
      `linear-gradient(180deg, rgba(255,255,255,${Math.min(0.98, milkOpacity + 0.12)}) 0%, rgba(255,255,255,${milkOpacity}) 100%)`,
      `color-mix(in srgb, ${toneColor} ${Math.round(tintOpacity * 100)}%, transparent)`,
    ].join(", "),
    backdropFilter: `blur(${resolvedBlur}px) saturate(${saturate}%)`,
    WebkitBackdropFilter: `blur(${resolvedBlur}px) saturate(${saturate}%)`,
    boxShadow: [
      `inset 0 0 0 1px color-mix(in srgb, ${toneColor} ${Math.round(edgeOpacity * 100)}%, rgba(255,255,255,0.85))`,
      `inset 1px 1px 0 rgba(255,255,255,${0.82 * resolvedShine})`,
      `inset -1px -1px 0 rgba(255,255,255,${0.42 * resolvedShine})`,
      `0 10px 28px rgba(0,0,0,${shadowOpacity})`,
      `0 2px 10px rgba(255,255,255,${clearShadowOpacity})`,
    ].join(", "),
  };
}

export function TintedGlassSurface({
  tone = "neutral",
  transparency = 0.1,
  tintStrength = 0.5,
  blurPx = 8,
  shineIntensity = 0.7,
  effect = "default",
  ...props
}: TintedGlassSurfaceProps) {
  const materialStyle = buildTintedMaterialStyle(
    tone,
    transparency,
    tintStrength,
    blurPx,
    shineIntensity,
  );

  return (
    <LiquidGlassSurface
      {...props}
      variant="widget"
      tone={tone}
      effect={effect}
      transparency={transparency}
      materialStyle={materialStyle}
    />
  );
}
