"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useState } from "react";

/**
 * GlassControl — interactive glass element with physical lens refraction.
 *
 * Based on the 3-layer technique:
 *   1. filter layer  — backdrop-filter blur + SVG lens (filter: url(#lg-lens))
 *   2. overlay layer — subtle white tint
 *   3. specular layer — chromatic inset highlights (picks up accentColor)
 *
 * All three layers are opacity:0 at rest → opacity:1 on active/hover.
 * This gives a satisfying "activate" feel on interaction.
 *
 * Usage:
 *   <GlassControl accentColor="#49a3fc" className="rounded-full px-8 py-4">
 *     Drag me
 *   </GlassControl>
 */

export interface GlassControlProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Accent color for chromatic specular highlights.
   * Defaults to neutral white. Pass your brand/theme color for tinted glass.
   * e.g. "#49a3fc" for blue, "#ff48a9" for rose.
   */
  accentColor?: string;
  /**
   * Controls whether the glass effect layers are visible.
   * If undefined, visibility is managed internally on hover/active.
   */
  active?: boolean;
  /**
   * Resting background (shown when glass layers are hidden).
   * Defaults to white like a physical control.
   */
  restingBackground?: string;
  /**
   * Resting box-shadow (shown when glass layers are hidden).
   */
  restingBoxShadow?: string;
  /**
   * Scale on press (squish effect). Default: "scaleY(0.97) scaleX(1.08)"
   */
  pressScale?: string;
}

export function GlassControl({
  children,
  className = "",
  style,
  accentColor = "rgba(255,255,255,1)",
  active: controlledActive,
  restingBackground = "#ffffff",
  restingBoxShadow = "0 1px 8px rgba(0,30,63,0.10), 0 0 2px rgba(0,9,20,0.10)",
  pressScale = "scaleY(0.97) scaleX(1.08)",
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onMouseEnter,
  onMouseLeave,
  ...divProps
}: GlassControlProps) {
  const [internalActive, setInternalActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isActive = controlledActive ?? (internalActive || hovered);

  // Specular highlights — tinted with accentColor
  const specularShadow = [
    `inset 1px 1px 0 color-mix(in srgb, ${accentColor} 20%, transparent)`,
    `inset 1px 3px 0 rgba(28,63,90,0.05)`,
    `inset 0 0 22px rgba(255,255,255,0.60)`,
    `inset -1px -1px 0 color-mix(in srgb, ${accentColor} 12%, transparent)`,
  ].join(", ");

  const layerOpacity = isActive ? 1 : 0;
  const layerTransition = "opacity 0.15s ease";

  return (
    <div
      className={`relative cursor-pointer overflow-hidden ${className}`}
      style={{
        backgroundColor: isActive ? "transparent" : restingBackground,
        boxShadow: isActive ? "none" : restingBoxShadow,
        transition:
          "background-color 0.4s cubic-bezier(0.175,0.885,0.32,2.2), box-shadow 0.4s cubic-bezier(0.175,0.885,0.32,2.2), border-radius 0.4s cubic-bezier(0.175,0.885,0.32,2.2), transform 0.15s ease",
        ...style,
      }}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); setInternalActive(false); onMouseLeave?.(e); }}
      onPointerDown={(e) => {
        setInternalActive(true);
        (e.currentTarget as HTMLElement).style.transform = pressScale;
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setInternalActive(false);
        (e.currentTarget as HTMLElement).style.transform = "";
        onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        setInternalActive(false);
        (e.currentTarget as HTMLElement).style.transform = "";
        onPointerLeave?.(e);
      }}
      {...divProps}
    >
      {/* Layer 1 — lens distortion + backdrop blur */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backdropFilter: "blur(0.6px)",
          WebkitBackdropFilter: "blur(0.6px)",
          filter: "url(#lg-lens)",
          opacity: layerOpacity,
          transition: layerTransition,
        }}
      />

      {/* Layer 2 — white tint overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.10)",
          opacity: layerOpacity,
          transition: layerTransition,
        }}
      />

      {/* Layer 3 — chromatic specular highlights */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          borderRadius: "inherit",
          boxShadow: specularShadow,
          opacity: layerOpacity,
          transition: layerTransition,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}
