"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { LiquidGlassSurface, type LiquidGlassSurfaceVariant } from "./materials";
import { glassRadius } from "./motion";
import { glassTransitions } from "./animations/transitions";

const pillShadowResting = "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.06)";
const pillShadowHovered =
  "0 2px 6px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.11), 0 0 0 1px rgba(255,255,255,0.45) inset";

export interface GlassPillFrameProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  hovered?: boolean;
  expandedMaxWidth?: number | string;
  variant?: LiquidGlassSurfaceVariant;
  tone?: "neutral" | "mist" | "cream" | "rose";
  transparency?: number;
  hoveredTransparency?: number;
  shineIntensity?: number;
  hoveredShineIntensity?: number;
  refractive?: boolean;
  surfaceFilter?: string;
  blurPx?: number;
  hoveredBlurPx?: number;
  saturation?: number;
  hoveredSaturation?: number;
  borderRadius?: number;
  opticalLayer?: ReactNode;
  padding?: string;
  hoveredPadding?: string;
}

export function GlassPillFrame({
  children,
  hovered = false,
  expandedMaxWidth,
  variant = "pill",
  tone = "neutral",
  transparency = 0.35,
  hoveredTransparency = 0.42,
  shineIntensity = 1,
  hoveredShineIntensity = 1,
  refractive = false,
  surfaceFilter,
  blurPx = 22,
  hoveredBlurPx = 24,
  saturation = 1.5,
  hoveredSaturation = 1.62,
  borderRadius = 999,
  opticalLayer,
  padding = "0.4rem 0.6rem",
  hoveredPadding = "0.6rem 0.8rem",
  className,
  style,
  ...divProps
}: GlassPillFrameProps) {
  const resolvedBorderRadius = hovered ? glassRadius(borderRadius, true) : glassRadius(borderRadius);

  return (
    <motion.div
      animate={{
        padding: hovered ? hoveredPadding : padding,
        boxShadow: hovered ? pillShadowHovered : pillShadowResting,
        borderRadius: resolvedBorderRadius,
      }}
      transition={glassTransitions.breathe}
      className={className}
      style={{
        ...style,
        maxWidth: hovered && expandedMaxWidth !== undefined ? expandedMaxWidth : style?.maxWidth,
      }}
      {...divProps}
    >
      <LiquidGlassSurface
        variant={variant}
        tone={tone}
        effect={hovered ? "amplified" : "default"}
        transparency={hovered ? hoveredTransparency : transparency}
        shineIntensity={hovered ? hoveredShineIntensity : shineIntensity}
        refractive={refractive}
        className="pointer-events-none absolute inset-0 z-0 [border-radius:inherit]"
        style={{
          borderRadius: "inherit",
          backdropFilter: `blur(${hovered ? hoveredBlurPx : blurPx}px) saturate(${hovered ? hoveredSaturation : saturation})`,
          WebkitBackdropFilter: `blur(${hovered ? hoveredBlurPx : blurPx}px) saturate(${hovered ? hoveredSaturation : saturation})`,
          filter: surfaceFilter,
        }}
        aria-hidden="true"
      >
        {opticalLayer}
        <span />
      </LiquidGlassSurface>

      {children}
    </motion.div>
  );
}

export const GlassPill = GlassPillFrame;

interface GlassOverflowFadesProps {
  visible: boolean;
  left: boolean;
  right: boolean;
}

export function GlassOverflowFades({
  visible,
  left,
  right,
}: GlassOverflowFadesProps) {
  return (
    <>
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-y-0 left-0 z-2 w-6 rounded-l-full",
          "transition-opacity duration-300 ease-out",
          visible && left ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.34) 12%, rgba(255,255,255,0.12) 42%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-y-0 right-0 z-2 w-6 rounded-r-full",
          "transition-opacity duration-300 ease-out",
          visible && right ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background:
            "linear-gradient(to left, rgba(255,255,255,0.34) 12%, rgba(255,255,255,0.12) 42%, transparent 100%)",
        }}
      />
    </>
  );
}
