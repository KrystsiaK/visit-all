"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LiquidGlassSurface,
  type GlassAnimationPreset,
  type GlassAnimationTrigger,
} from "../src/materials";
import { GlassFilterDefs } from "../src/GlassFilterDefs";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Liquid Glass / Glass Pill",
  parameters: { layout: "fullscreen", backgrounds: { disable: true }, docs: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TONES = ["neutral", "mist", "cream", "rose"] as const;
const VARIANTS = ["shell", "shellStrong", "widget", "pill", "control", "inset"] as const;

// ---------------------------------------------------------------------------
// Story 0: Enhanced Glass — 4-layer architecture
// ---------------------------------------------------------------------------

interface EnhancedGlassArgs {
  transparency: number;
  blurMultiplier: number;
  distortionScale: number;
  shineIntensity: number;
  label: string;
}

function EnhancedGlassDemo({ transparency, blurMultiplier, distortionScale, shineIntensity, label }: EnhancedGlassArgs) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const glassRef = useRef<HTMLDivElement | null>(null);
  const start = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const expanded = hovered || dragging;

  // Calculate glass properties
  const transparencyScale = Math.pow(1 - transparency, 1.8);
  const bgAlpha = Math.max(0.1, 2.5 * transparencyScale);
  const visibleBlur = Math.max(6, 22 * blurMultiplier * (1 - transparency * 0.25));
  const visibleSaturate = Math.max(100, 135 - transparency * 20);
  const shineLight = 0.5 * (1 - transparency * 0.3) * shineIntensity;
  const shineDark = 0.35 * (1 - transparency * 0.3) * shineIntensity;

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    start.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({ x: start.current.px + e.clientX - start.current.mx, y: start.current.py + e.clientY - start.current.my });
  };
  const onUp = () => setDragging(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <GlassFilterDefs />

      {/* SVG filter for enhanced distortion */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter
            id="enhanced-glass-distortion"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.015"
              numOctaves="2"
              seed="7"
              result="turbulence"
            />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="softNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale={distortionScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feSpecularLighting
              in="softNoise"
              surfaceScale="5"
              specularConstant="0.8"
              specularExponent="100"
              lighting-color="white"
              result="specLight"
            >
              <fePointLight x="-200" y="-200" z="300" />
            </feSpecularLighting>
            <feComposite
              in="displaced"
              in2="specLight"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="0.15"
              k4="0"
            />
          </filter>
        </defs>
      </svg>

      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #fde68a 0%, #fb923c 18%, #f43f5e 36%, #a855f7 54%, #3b82f6 72%, #06b6d4 90%, #10b981 100%)",
      }} />

      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Background text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
        <p className="text-white/50 font-black text-[120px] leading-none tracking-tighter">GLASS</p>
        <p className="text-white/30 text-sm font-semibold tracking-[0.35em] uppercase">4-layer architecture</p>
      </div>

      {/* Draggable enhanced glass */}
      <motion.div
        ref={glassRef}
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          x: pos.x,
          y: pos.y,
          translateX: "-50%",
          translateY: "-50%",
          cursor: dragging ? "grabbing" : "grab",
          zIndex: 20,
        }}
        animate={{
          scale: dragging ? 1.02 : 1,
          padding: expanded ? "0.6rem" : "0.4rem",
          borderRadius: expanded ? "1.8rem" : "1.4rem",
        }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 2.2] }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setDragging(false);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* Enhanced glass container */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2), 0 0 40px rgba(0, 0, 0, 0.1)",
          }}
          animate={{
            borderRadius: expanded ? "1.8rem" : "1.4rem",
          }}
          transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 2.2] }}
        >
          {/* Layer 0: Effect (backdrop + SVG distortion) */}
          <div
            className="absolute inset-0"
            style={{
              zIndex: 0,
              backdropFilter: `blur(${visibleBlur}px) saturate(${visibleSaturate}%)`,
              WebkitBackdropFilter: `blur(${visibleBlur}px) saturate(${visibleSaturate}%)`,
              filter: "url(#enhanced-glass-distortion)",
              isolation: "isolate",
            }}
          />

          {/* Layer 1: Tint (dynamic transparency) */}
          <div
            className="absolute inset-0"
            style={{
              zIndex: 1,
              background: `color-mix(in srgb, #c0c0c2 ${bgAlpha}%, transparent)`,
              transition: "background-color 300ms cubic-bezier(1,0,0.4,1)",
            }}
          />

          {/* Layer 2: Shine (specular highlights) */}
          <div
            className="absolute inset-0"
            style={{
              zIndex: 2,
              boxShadow: `inset 2px 2px 1px rgba(255, 255, 255, ${shineLight}), inset -1px -1px 1px rgba(255, 255, 255, ${shineDark})`,
              transition: "box-shadow 300ms cubic-bezier(1,0,0.4,1)",
            }}
          />

          {/* Layer 3: Content */}
          <div className="relative z-[3] px-12 py-6 text-center text-white">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] opacity-50">
              4-Layer Architecture
            </div>
            <div className="text-2xl font-semibold mt-2 opacity-95">
              {label}
            </div>
            <div className="text-[11px] opacity-40 mt-2">
              transparency {transparency.toFixed(2)} · blur {visibleBlur.toFixed(1)}px · distort {distortionScale}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {!dragging && pos.x === 0 && pos.y === 0 && (
            <motion.p
              className="absolute -bottom-7 left-0 right-0 text-center text-white/40 text-xs pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2 }}
            >
              drag to inspect · adjust controls
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export const EnhancedGlass: Story = {
  name: "Enhanced Glass (4-Layer)",
  args: {
    transparency: 0.3,
    blurMultiplier: 1.0,
    distortionScale: 150,
    shineIntensity: 0.5,
    label: "Enhanced Liquid Glass",
  },
  argTypes: {
    transparency: {
      control: { type: "range", min: 0, max: 0.9, step: 0.05 },
      description: "Transparency: 0 = frosted glass, 0.9 = very transparent",
    },
    blurMultiplier: {
      control: { type: "range", min: 0.1, max: 2, step: 0.1 },
      description: "Blur multiplier (base 22px)",
    },
    distortionScale: {
      control: { type: "range", min: 50, max: 300, step: 10 },
      description: "SVG distortion / refraction strength",
    },
    shineIntensity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
      description: "Specular highlight intensity",
    },
    label: {
      control: "text",
      description: "Pill label text",
    },
  },
  render: (args) => <EnhancedGlassDemo {...(args as EnhancedGlassArgs)} />,
};

// ---------------------------------------------------------------------------
// Story 1: LiquidGlassSurface - base component
// ---------------------------------------------------------------------------

interface SurfaceArgs {
  variant: typeof VARIANTS[number];
  tone: typeof TONES[number];
  transparency: number;
  borderRadius: number;
  text: string;
  refractive: boolean;
  animation: GlassAnimationPreset;
  animationTrigger: GlassAnimationTrigger;
}

function SurfaceDemo({
  variant,
  tone,
  transparency,
  borderRadius,
  text,
  refractive,
  animation,
  animationTrigger,
}: SurfaceArgs) {
  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <GlassFilterDefs />

      {/* Colorful background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #fde68a 0%, #fb923c 18%, #f43f5e 36%, #a855f7 54%, #3b82f6 72%, #06b6d4 90%, #10b981 100%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 300, height: 300, background: "rgba(255,255,255,0.15)", top: "10%", left: "5%" }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 200, height: 200, background: "rgba(255,255,255,0.12)", bottom: "15%", right: "8%" }}
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Background text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
        <p className="text-white/50 font-black text-[90px] leading-none tracking-tighter">LIQUID</p>
        <p className="text-white/30 text-sm font-semibold tracking-[0.35em] uppercase">glass · surface · component</p>
      </div>

      {/* LiquidGlassSurface in the center */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <LiquidGlassSurface
          variant={variant}
          tone={tone}
          transparency={transparency}
          refractive={refractive}
          animation={animation}
          animationTrigger={animationTrigger}
          style={{
            borderRadius,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              {variant} · {tone}
            </span>
            <span className="text-2xl font-semibold text-white/90">{text}</span>
            <div className="flex gap-3 mt-1 text-[10px] text-white/35">
              <span>transparency {transparency.toFixed(2)}</span>
              <span>·</span>
              <span>{refractive ? "refractive" : "standard"}</span>
              <span>·</span>
              <span>{animation}</span>
              <span>·</span>
              <span>{animationTrigger}</span>
            </div>
          </div>
        </LiquidGlassSurface>
      </div>

      {/* Hints */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-white/25 text-xs uppercase tracking-widest">
        <span>adjust transparency</span>
        <span>→</span>
        <span>{animationTrigger === "click" ? "click to toggle animation" : animationTrigger === "tap" ? "press to see animation" : animationTrigger === "mount" ? "animation runs on mount" : "hover to see animation"}</span>
      </div>
    </div>
  );
}

export const Surface: Story = {
  name: "LiquidGlassSurface",
  args: {
    variant: "pill",
    tone: "neutral",
    transparency: 0.35,
    borderRadius: 999,
    text: "Liquid Glass",
    refractive: false,
    animation: "breathe",
    animationTrigger: "click",
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS, description: "Surface variant - each one has its own blur/saturate/shadow tuning" },
    tone: { control: "select", options: TONES, description: "Glass tone - neutral or tinted" },
    transparency: {
      control: { type: "range", min: 0, max: 0.9, step: 0.05 },
      description: "Transparency: 0 = default variant tint, 0.9 = almost fully transparent glass"
    },
    borderRadius: { control: { type: "range", min: 0, max: 999, step: 4 }, description: "Corner radius (px)" },
    text: { control: "text", description: "Inner text" },
    refractive: { control: "boolean", description: "Enable the stronger refraction effect (requires GlassFilterDefs)" },
    animation: {
      control: "select",
      options: ["none", "breathe", "fadeUp", "scaleIn", "slideRight", "slideLeft", "float", "press"],
      description: "Animation: breathe = macOS-style hover (padding + border-radius), the others are entrance effects"
    },
    animationTrigger: {
      control: "select",
      options: ["mount", "hover", "tap", "click"],
      description: "Which interaction should trigger the animation",
    },
  },
  render: (args) => <SurfaceDemo {...(args as SurfaceArgs)} />,
};

// ---------------------------------------------------------------------------
// GlassPill — reusable 3-layer component
//
// Layer 0: backdrop-filter blur+saturate — frosted glass (works everywhere)
//          + filter:url(#lg-glass-soft) on same div — SVG distortion
//            (filter: on an element distorts how IT renders including backdrop)
// Layer 1: tint rgba + specular inset shadows
// Layer 2: content (unaffected by filter)
// ---------------------------------------------------------------------------

function DragBackdropArtwork() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #fde68a 0%, #fb923c 18%, #f43f5e 36%, #a855f7 54%, #3b82f6 72%, #06b6d4 90%, #10b981 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 380, height: 380, background: "rgba(255,255,255,0.15)", top: "5%", left: "3%" }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: "rgba(255,255,255,0.12)", bottom: "8%", right: "6%" }}
        animate={{ y: [0, 25, 0], x: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
        <p className="text-white/55 font-black text-[96px] leading-none tracking-tighter">GLASS</p>
        <p className="text-white/35 text-sm font-semibold tracking-[0.3em] uppercase">drag · inspect · backdrop</p>
      </div>
    </>
  );
}

function PillOpticalRefractionLayer({
  position,
  viewportWidth,
  viewportHeight,
  transparency,
}: {
  position: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  transparency: number;
}) {
  const t = Math.min(0.95, Math.max(0, transparency));
  const layerOpacity = 0.2 + t * 0.5;
  const scale = 1.02 + t * 0.03;
  const driftX = t * 8;
  const driftY = t * 5;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [border-radius:inherit]"
      style={{
        maskImage:
          "radial-gradient(146% 126% at 50% 46%, black 0%, rgba(0,0,0,0.98) 42%, rgba(0,0,0,0.88) 72%, rgba(0,0,0,0.52) 91%, rgba(0,0,0,0.16) 97%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(146% 126% at 50% 46%, black 0%, rgba(0,0,0,0.98) 42%, rgba(0,0,0,0.88) 72%, rgba(0,0,0,0.52) 91%, rgba(0,0,0,0.16) 97%, transparent 100%)",
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left saturate-[1.22]"
        style={{
          width: viewportWidth,
          height: viewportHeight,
          opacity: layerOpacity,
          transform: `translate(${-(position.x - 1) + driftX}px, ${-(position.y - 1) + driftY}px) scale(${scale})`,
          filter: "url(#lg-displace-strong)",
          transition: "transform 180ms cubic-bezier(0.22,1,0.36,1), opacity 180ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <DragBackdropArtwork />
      </div>
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.28 + t * 0.22,
          background:
            "radial-gradient(circle_at_26%_18%,rgba(255,255,255,0.18),rgba(255,255,255,0)_24%),radial-gradient(circle_at_72%_74%,rgba(255,255,255,0.1),rgba(255,255,255,0)_24%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),rgba(255,255,255,0)_68%)",
        }}
      />
    </div>
  );
}

function GlassPill({
  tone = "neutral",
  variant = "pill",
  borderRadius = 999,
  transparency = 0.35,
  opticalLayer,
  children,
}: {
  tone?: typeof TONES[number];
  variant?: typeof VARIANTS[number];
  borderRadius?: number;
  transparency?: number;
  opticalLayer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative", borderRadius, overflow: "hidden" }}>
      <LiquidGlassSurface
        variant={variant}
        tone={tone}
        transparency={transparency}
        className="relative z-1"
        style={{
          borderRadius: "inherit",
        }}
      >
        {opticalLayer}
        {children}
      </LiquidGlassSurface>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story 1: Drag & Inspect
// ---------------------------------------------------------------------------

interface DemoArgs {
  tone: typeof TONES[number];
  variant: typeof VARIANTS[number];
  borderRadius: number;
  transparency: number;
  label: string;
}

function DragDemo({ tone, variant, borderRadius, transparency, label }: DemoArgs) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [pillSize, setPillSize] = useState({ width: 0, height: 0 });
  const start = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateSize = () => {
      setViewportSize({ width: viewport.clientWidth, height: viewport.clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) {
      return;
    }

    const updateSize = () => {
      setPillSize({ width: pill.clientWidth, height: pill.clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(pill);
    return () => observer.disconnect();
  }, []);

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    start.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({ x: start.current.px + e.clientX - start.current.mx, y: start.current.py + e.clientY - start.current.my });
  };
  const onUp = () => setDragging(false);

  const opticalPosition = {
    x: viewportSize.width / 2 - pillSize.width / 2 + pos.x,
    y: viewportSize.height / 2 - pillSize.height / 2 + pos.y,
  };

  return (
    <div ref={viewportRef} className="relative w-screen h-screen overflow-hidden select-none">
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <filter id="lg-displace-strong" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.18" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="14" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>
      </svg>
      <DragBackdropArtwork />

      {/* Draggable pill */}
      <motion.div
        ref={pillRef}
        className="absolute"
        style={{ left: "50%", top: "50%", x: pos.x, y: pos.y, translateX: "-50%", translateY: "-50%", cursor: dragging ? "grabbing" : "grab", zIndex: 20 }}
        animate={{ scale: dragging ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <GlassPill
          tone={tone}
          variant={variant}
          borderRadius={borderRadius}
          transparency={transparency}
          opticalLayer={
            viewportSize.width > 0 && viewportSize.height > 0 ? (
              <PillOpticalRefractionLayer
                position={opticalPosition}
                viewportWidth={viewportSize.width}
                viewportHeight={viewportSize.height}
                transparency={transparency}
              />
            ) : null
          }
        >
          <div className="relative z-1 flex flex-col items-center gap-1 px-10 py-5">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">{variant} · {tone}</span>
            <span className="text-2xl font-semibold text-white/95">{label}</span>
            <span className="text-[11px] text-white/40">transparency {transparency.toFixed(2)}</span>
          </div>
        </GlassPill>
        <AnimatePresence>
          {!dragging && pos.x === 0 && pos.y === 0 && (
            <motion.p className="absolute -bottom-7 left-0 right-0 text-center text-white/40 text-xs pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.2 }}>
              drag over the background
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export const Interactive: Story = {
  name: "Drag & Inspect",
  args: {
    tone: "neutral",
    variant: "pill",
    borderRadius: 999,
    transparency: 0.35,
    label: "Liquid Glass",
  },
  argTypes: {
    tone: { control: "select", options: TONES, description: "Glass tone" },
    variant: { control: "select", options: VARIANTS, description: "Surface variant" },
    borderRadius: { control: { type: "range", min: 0, max: 999, step: 4 }, description: "Corner radius" },
    transparency: { control: { type: "range", min: 0, max: 0.9, step: 0.05 }, description: "Additional glass transparency" },
    label: { control: "text", description: "Pill label text" },
  },
  render: (args) => <DragDemo {...(args as DemoArgs)} />,
};

// ---------------------------------------------------------------------------
// Story 2: All Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  render: () => (
    <div className="relative min-h-screen flex items-center justify-center p-12" style={{
      background: "linear-gradient(135deg, #fde68a 0%, #fb923c 20%, #f43f5e 40%, #a855f7 60%, #3b82f6 80%, #06b6d4 100%)",
    }}>
      <div className="grid grid-cols-3 gap-5">
        {VARIANTS.map((variant) => (
          <GlassPill
            key={variant}
            variant={variant}
            tone="neutral"
            borderRadius={variant === "pill" ? 999 : 24}
            transparency={0.25}
          >
            <div className="flex flex-col gap-0.5 px-8 py-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">variant</span>
              <span className="text-lg font-semibold text-white/90">{variant}</span>
            </div>
          </GlassPill>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3a: Morphing border-radius (pill ↔ card)
// ---------------------------------------------------------------------------

export const MorphingShape: Story = {
  render: () => {
    function MorphDemo() {
      const [expanded, setExpanded] = useState(false);
      return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1a2e 100%)",
        }}>
          {/* Star field */}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/60"
              style={{ width: 2, height: 2, left: `${(i * 37 + 7) % 100}%`, top: `${(i * 53 + 13) % 100}%`, opacity: 0.2 + (i % 5) * 0.1 }} />
          ))}
          <motion.div
            animate={{ borderRadius: expanded ? 28 : 999 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
            onClick={() => setExpanded(v => !v)}
          >
            <motion.div aria-hidden="true" animate={{ borderRadius: expanded ? 28 : 999 }}
              style={{ position: "absolute", inset: 0, zIndex: 0, backdropFilter: "blur(28px) saturate(1.6)", WebkitBackdropFilter: "blur(28px) saturate(1.6)" }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            />
            <motion.div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.09)", boxShadow: "inset 1px 1px 1px rgba(255,255,255,0.35), inset -1px -1px 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.35)" }}
              animate={{ borderRadius: expanded ? 28 : 999, width: expanded ? 320 : 180, height: expanded ? 220 : 52 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="flex flex-col items-center justify-center gap-3 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {expanded ? (
                  <motion.div key="card" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} className="flex flex-col items-center gap-2 px-6">
                    <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl">✦</div>
                    <p className="text-white/90 font-semibold text-lg text-center">Glass Card</p>
                    <p className="text-white/45 text-xs text-center leading-relaxed">Click to collapse back into a pill</p>
                  </motion.div>
                ) : (
                  <motion.div key="pill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-6">
                    <span className="text-white/90 text-sm font-semibold">Tap to expand</span>
                    <span className="text-white/40 text-xs">→</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
          <p className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase">click to morph</p>
        </div>
      );
    }
    return <MorphDemo />;
  },
};

// ---------------------------------------------------------------------------
// Story 3b: Depth Stack (z-layers of glass)
// ---------------------------------------------------------------------------

const STACK_ITEMS = [
  { label: "System", sub: "macOS Sequoia 16.1", icon: "◈", offset: 0 },
  { label: "Network", sub: "Connected · 24ms", icon: "◎", offset: 1 },
  { label: "Display", sub: "Liquid Retina XDR", icon: "◻", offset: 2 },
  { label: "Audio", sub: "AirPods Pro 3", icon: "◉", offset: 3 },
];

export const DepthStack: Story = {
  render: () => (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
      background: "linear-gradient(160deg, #164e63 0%, #0f172a 40%, #1e1b4b 100%)",
    }}>
      {/* Ambient blobs */}
      <div className="absolute rounded-full pointer-events-none" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", top: "-10%", left: "-5%" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)", bottom: "-5%", right: "0" }} />

      <div className="relative flex flex-col" style={{ gap: 0 }}>
        {STACK_ITEMS.map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ x: 8, zIndex: 10 }}
            style={{ position: "relative", marginTop: i === 0 ? 0 : -12, zIndex: STACK_ITEMS.length - i }}
          >
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, width: 340, boxShadow: `0 ${8 + item.offset * 6}px ${24 + item.offset * 12}px rgba(0,0,0,${0.3 + item.offset * 0.08})` }}>
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)" }} />
              <div style={{ position: "relative", zIndex: 1, background: `rgba(255,255,255,${0.06 + (STACK_ITEMS.length - i) * 0.015})`, boxShadow: "inset 1px 1px 1px rgba(255,255,255,0.22), inset -1px -1px 1px rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "rgba(255,255,255,0.1)" }}>{item.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-white/85 font-semibold text-sm">{item.label}</span>
                    <span className="text-white/40 text-xs">{item.sub}</span>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400/70" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3c: Notification Toast Stream
// ---------------------------------------------------------------------------

interface Toast { id: number; title: string; body: string; icon: string; color: string }
const TOAST_TEMPLATES: Omit<Toast, "id">[] = [
  { title: "New message", body: "Hey, are you free tonight?", icon: "💬", color: "#3b82f6" },
  { title: "Payment received", body: "$42.00 from Alex M.", icon: "💳", color: "#10b981" },
  { title: "Build succeeded", body: "main → production ✓", icon: "🚀", color: "#8b5cf6" },
  { title: "Reminder", body: "Design review in 10 min", icon: "🔔", color: "#f59e0b" },
  { title: "Download complete", body: "archive.zip — 2.4 GB", icon: "⬇️", color: "#06b6d4" },
];

export const NotificationStream: Story = {
  render: () => {
    function ToastDemo() {
      const [toasts, setToasts] = useState<Toast[]>([]);
      const counter = useRef(0);
      const push = () => {
        const t = TOAST_TEMPLATES[counter.current % TOAST_TEMPLATES.length];
        counter.current++;
        const id = Date.now();
        setToasts(prev => [{ ...t, id }, ...prev].slice(0, 5));
      };
      const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
      return (
        <div className="relative min-h-screen flex flex-col items-center justify-center gap-6 overflow-hidden" style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fca5a5 60%, #c4b5fd 100%)",
        }}>
          {/* Blurred text bg */}
          <div className="absolute inset-0 flex flex-wrap gap-2 p-4 overflow-hidden pointer-events-none opacity-20">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} className="text-xs font-bold text-amber-900 whitespace-nowrap">
                {["NOTIFICATION", "ALERT", "MESSAGE", "UPDATE", "PING"][i % 5]}
              </span>
            ))}
          </div>

          {/* Button */}
          <button onClick={push}
            className="relative z-10 px-7 py-3 rounded-full font-semibold text-sm text-white/90 select-none active:scale-95 transition-transform"
            style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "inset 1px 1px 1px rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.2)" }}>
            Push notification
          </button>

          {/* Toast list */}
          <div className="relative z-10 flex flex-col gap-3 w-80">
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div key={toast.id}
                  initial={{ opacity: 0, y: -16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  onClick={() => dismiss(toast.id)} style={{ cursor: "pointer" }}
                >
                  <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, boxShadow: "0 8px 28px rgba(0,0,0,0.14)" }}>
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)" }} />
                    <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.22)", boxShadow: "inset 1px 1px 1px rgba(255,255,255,0.6), inset -1px -1px 1px rgba(255,255,255,0.3)" }}>
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: toast.color + "22" }}>
                          {toast.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-black/75 font-semibold text-sm truncate">{toast.title}</span>
                          <span className="text-black/45 text-xs truncate">{toast.body}</span>
                        </div>
                        <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: toast.color }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {toasts.length === 0 && (
              <p className="text-center text-black/30 text-xs tracking-widest uppercase pt-2">no notifications</p>
            )}
          </div>
          <p className="relative z-10 text-black/25 text-xs">click a toast to dismiss</p>
        </div>
      );
    }
    return <ToastDemo />;
  },
};

// ---------------------------------------------------------------------------
// Story 3d: Glass HUD / Instrument Panel
// ---------------------------------------------------------------------------

function useAnimatedValue(min: number, max: number, speed = 0.008) {
  const [value, setValue] = useState(() => (min + max) / 2);
  const dir = useRef(1);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setValue(v => {
        let next = v + dir.current * speed * (max - min);
        if (next >= max) { next = max; dir.current = -1; }
        if (next <= min) { next = min; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [min, max, speed]);
  return value;
}

function HudArc({
  value,
  max,
  color,
  size = 88,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const pct = value / max;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.12s linear" }}
      />
    </svg>
  );
}

function HudGauge({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, width: 120 }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255,255,255,0.07)",
          boxShadow: "inset 1px 1px 1px rgba(255,255,255,0.2), inset -1px -1px 1px rgba(0,0,0,0.15)",
        }}
      >
        <div className="flex flex-col items-center gap-1 py-4">
          <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
            <HudArc value={value} max={max} color={color} />
            <div className="absolute flex flex-col items-center">
              <span className="text-lg leading-none font-black" style={{ color }}>
                {Math.round(value)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/35">{unit}</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
        </div>
      </div>
    </div>
  );
}

function GlassHudScene() {
  const speed = useAnimatedValue(0, 240, 0.004);
  const rpm = useAnimatedValue(0, 8000, 0.006);
  const fuel = useAnimatedValue(10, 95, 0.002);
  const temp = useAnimatedValue(60, 110, 0.001);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #020617 0%, #0f172a 50%, #0c1a2e 100%)" }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          width: 600,
          height: 300,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div style={{ position: "relative", overflow: "hidden", borderRadius: 28 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(32px) saturate(1.6)",
            WebkitBackdropFilter: "blur(32px) saturate(1.6)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: "rgba(255,255,255,0.07)",
            boxShadow:
              "inset 2px 2px 1px rgba(255,255,255,0.18), inset -1px -1px 1px rgba(255,255,255,0.08), 0 12px 48px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex flex-col items-center gap-1 px-14 py-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">speed</span>
            <div className="relative flex items-end gap-1">
              <span
                className="text-[72px] leading-none font-black tabular-nums"
                style={{ color: "#818cf8", textShadow: "0 0 40px rgba(129,140,248,0.5)" }}
              >
                {Math.round(speed).toString().padStart(3, "0")}
              </span>
              <span className="mb-2 text-lg font-semibold text-white/40">km/h</span>
            </div>
            <div
              className="mt-1 h-0.5 w-full rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, #818cf8 ${(speed / 240) * 100}%, rgba(255,255,255,0.08) ${(speed / 240) * 100}%)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <HudGauge label="RPM" value={rpm} max={8000} unit="×1000" color="#f472b6" />
        <HudGauge label="Fuel" value={fuel} max={100} unit="%" color="#34d399" />
        <HudGauge label="Temp" value={temp} max={120} unit="°C" color="#fb923c" />
      </div>
    </div>
  );
}

export const GlassHUD: Story = {
  render: () => <GlassHudScene />,
};

// ---------------------------------------------------------------------------
// Story 3: Tone Comparison on light bg + text backdrop
// ---------------------------------------------------------------------------

export const ToneComparison: Story = {
  name: "Tones",
  render: () => (
    <div className="relative min-h-screen flex items-center justify-center p-12 overflow-hidden" style={{
      background: "linear-gradient(160deg, #e0f2fe 0%, #fce7f3 50%, #fef9c3 100%)",
    }}>
      <div className="absolute inset-0 p-6 overflow-hidden pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <p key={i} className="text-neutral-400/25 text-xl font-bold leading-10 whitespace-nowrap">
            Backdrop Filter · Blur · Saturate · Refraction · Glass Surface · Tint · Specular ·
          </p>
        ))}
      </div>
      <div className="relative flex gap-6 flex-wrap justify-center">
        {TONES.map((tone) => (
          <GlassPill key={tone} tone={tone} variant="widget" borderRadius={28} transparency={0.2}>
            <div className="flex flex-col gap-1 px-10 py-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/30">tone</span>
              <span className="text-2xl font-semibold text-black/65 capitalize">{tone}</span>
            </div>
          </GlassPill>
        ))}
      </div>
    </div>
  ),
};
