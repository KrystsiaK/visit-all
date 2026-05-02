"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

import {
  GlassInput,
  GlassFilterDefs,
  LiquidGlassSurface,
  GlassControl,
  liquidGlassHoverTransition,
  liquidGlassMotion,
  liquidGlassPressTransition,
  glassRadius,
  injectDriftKeyframes,
} from "../src";

const meta = {
  title: "Liquid Glass/Overview",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Synarava liquid-glass should be judged in real scenes: noisy backgrounds, moving content, hover response, and focused inputs. Token dumps are only supporting references.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function SceneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[40px] border border-black/8 shadow-[0_30px_80px_rgba(15,23,42,0.16)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#d6ebf7_0%,#e9f5f7_44%,#faf4e8_100%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 760"
        className="absolute inset-0 h-full w-full opacity-95"
        preserveAspectRatio="none"
      >
        <rect width="1200" height="760" fill="transparent" />
        <rect x="62" y="48" width="212" height="146" rx="28" fill="#fae044" />
        <rect x="278" y="48" width="244" height="146" rx="28" fill="#f7f5ee" />
        <rect x="526" y="48" width="276" height="146" rx="28" fill="#d9ecff" />
        <rect x="806" y="48" width="312" height="146" rx="28" fill="#fff3d3" />
        <rect x="84" y="228" width="468" height="188" rx="34" fill="rgba(255,255,255,0.62)" />
        <rect x="88" y="232" width="460" height="8" rx="4" fill="#ff3b30" />
        <rect x="234" y="232" width="144" height="8" rx="4" fill="#f7df1e" />
        <rect x="378" y="232" width="170" height="8" rx="4" fill="#0047ff" />
        <rect x="610" y="238" width="250" height="156" rx="28" fill="rgba(255,255,255,0.56)" />
        <rect x="884" y="228" width="236" height="212" rx="32" fill="rgba(255,255,255,0.58)" />
        <rect x="84" y="470" width="332" height="176" rx="30" fill="rgba(255,255,255,0.55)" />
        <rect x="450" y="470" width="328" height="176" rx="30" fill="rgba(255,255,255,0.55)" />
        <rect x="812" y="470" width="308" height="176" rx="30" fill="rgba(255,255,255,0.55)" />
        <path d="M0 286H1200" stroke="rgba(255,255,255,0.32)" strokeWidth="2" />
        <path d="M0 520H1200" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.36)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute left-[86px] top-[258px] text-[13px] font-black uppercase tracking-[0.24em] text-neutral-400/90">
        Synarava map scene
      </div>
      <div className="absolute left-[628px] top-[264px] max-w-[180px] text-[11px] font-semibold leading-5 text-neutral-500/95">
        Glass should still reveal color blocks, type rhythm, and interface density underneath it.
      </div>
      <div className="absolute left-[886px] top-[254px] max-w-[170px] text-[11px] font-black uppercase tracking-[0.24em] text-neutral-500/85">
        Rich background
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function InteractiveGlassLab() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 48, y: 42 });
  const dragState = useRef<{ offsetX: number; offsetY: number } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    dragState.current = {
      offsetX: event.clientX - rect.left - position.x,
      offsetY: event.clientY - rect.top - position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragState.current;
    if (!viewport || !drag) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const cardWidth = 390;
    const cardHeight = 224;
    const nextX = event.clientX - rect.left - drag.offsetX;
    const nextY = event.clientY - rect.top - drag.offsetY;

    setPosition({
      x: Math.max(24, Math.min(rect.width - cardWidth - 24, nextX)),
      y: Math.max(24, Math.min(rect.height - cardHeight - 24, nextY)),
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
          Interactive lab
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
          Scroll the background and drag the glass
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          A real glass test needs movement underneath it. Scroll the scene, then drag the shell
          card and watch whether the material still feels calm, layered, and readable.
        </p>
      </div>

      <div
        ref={viewportRef}
        className="relative h-[720px] overflow-hidden rounded-[42px] border border-black/10 shadow-[0_34px_90px_rgba(15,23,42,0.16)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#d6ebf7_0%,#e9f5f7_44%,#faf4e8_100%)]" />
        <svg
          aria-hidden="true"
          viewBox="0 0 1400 1400"
          className="absolute inset-0 h-full w-full opacity-95"
          preserveAspectRatio="none"
        >
          <rect width="1400" height="1400" fill="transparent" />
          <rect x="86" y="72" width="220" height="172" rx="36" fill="#ff453a" />
          <rect x="306" y="72" width="240" height="172" rx="36" fill="#fae044" />
          <rect x="550" y="72" width="318" height="172" rx="36" fill="#d6ebff" />
          <rect x="888" y="72" width="330" height="172" rx="36" fill="#f7f5ee" />
          <rect x="104" y="308" width="560" height="238" rx="40" fill="rgba(255,255,255,0.64)" />
          <rect x="104" y="566" width="280" height="164" rx="34" fill="rgba(255,255,255,0.58)" />
          <rect x="408" y="566" width="360" height="164" rx="34" fill="rgba(255,255,255,0.58)" />
          <rect x="802" y="320" width="420" height="270" rx="44" fill="rgba(255,255,255,0.56)" />
          <rect x="802" y="642" width="472" height="282" rx="44" fill="rgba(255,255,255,0.58)" />
          <rect x="262" y="840" width="430" height="246" rx="40" fill="rgba(255,255,255,0.6)" />
          <rect x="734" y="978" width="380" height="210" rx="36" fill="rgba(255,255,255,0.56)" />
          <path d="M0 284H1400" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
          <path d="M0 764H1400" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
          <path d="M0 1092H1400" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        </svg>
        <div className="absolute inset-0 opacity-32 [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.26)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="absolute inset-0 overflow-auto">
          <div className="relative h-[1280px] min-w-full">
            <div className="absolute left-24 top-28 max-w-[240px] text-[13px] font-black uppercase tracking-[0.24em] text-neutral-500/90">
              Move the background under the glass
            </div>
            <div className="absolute left-[350px] top-118 max-w-[420px] text-[42px] font-semibold tracking-tight text-neutral-900/70">
              The material should reveal color, shape, and type.
            </div>
            <div className="absolute left-[814px] top-[336px] max-w-[320px] text-[16px] leading-7 text-neutral-600/85">
              If everything disappears behind the surface, it is not liquid glass. It is just a
              pale card with blur.
            </div>
            <div className="absolute left-16 top-20 h-44 w-44 rounded-[36px] bg-[#f9dd4b] shadow-[0_18px_40px_rgba(249,221,75,0.25)]" />
            <div className="absolute left-[320px] top-24 h-72 w-56 rounded-[32px] bg-[#f8f7f0]" />
            <div className="absolute left-[640px] top-16 h-52 w-80 rounded-[40px] bg-[#d9ecff]" />
            <div className="absolute left-[108px] top-[360px] h-64 w-[520px] rounded-[34px] border border-black/8 bg-white/55 p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">Map content</p>
              <div className="mt-5 space-y-4">
                <div className="h-8 w-56 rounded-full bg-[#f2f0e9]" />
                <div className="h-8 w-72 rounded-full bg-[#ebf3f8]" />
                <div className="h-32 rounded-[24px] bg-[linear-gradient(135deg,#fff0a8,#d7efff)]" />
              </div>
            </div>
            <div className="absolute left-[720px] top-[380px] h-80 w-[360px] rounded-[40px] bg-[#fdfbf3] p-8 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">Reference</p>
              <div className="mt-6 space-y-5">
                <div className="h-7 w-44 rounded-full bg-[#d9ebfb]" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 rounded-[24px] bg-[#fff2c9]" />
                  <div className="h-28 rounded-[24px] bg-[#e4f2ff]" />
                </div>
                <div className="h-36 rounded-[28px] border border-dashed border-black/10 bg-white/65" />
              </div>
            </div>
            <div className="absolute left-[360px] top-[820px] h-72 w-[620px] rounded-[40px] bg-white/58 p-8 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">Dense content</p>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 rounded-[22px] bg-[linear-gradient(135deg,#f7f4eb,#dcecf8)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <LiquidGlassSurface
          variant="shellStrong"
          className="absolute w-[390px] cursor-grab rounded-[34px] px-6 py-5 active:cursor-grabbing"
          style={{
            left: position.x,
            top: position.y,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="space-y-4 select-none">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Floating shell
                </p>
                <h2 className="text-[2rem] font-semibold tracking-tight text-neutral-950">
                  Drag me
                </h2>
              </div>
              <LiquidGlassSurface variant="control" className="rounded-full p-3">
                <div className="h-8 w-8 rounded-full border border-black/10 bg-white/20" />
              </LiquidGlassSurface>
            </div>
            <div className="flex gap-3">
              {["Pins", "Paths", "Zones"].map((item) => (
                <LiquidGlassSurface key={item} variant="pill" className="rounded-full px-5 py-3">
                  <span className="text-sm font-semibold text-neutral-900">{item}</span>
                </LiquidGlassSurface>
              ))}
            </div>
            <p className="text-sm leading-6 text-neutral-600">
              If this still feels believable while the background moves and the shell changes
              position, then the material system is starting to become trustworthy.
            </p>
          </div>
        </LiquidGlassSurface>
      </div>
    </div>
  );
}

function OpticalSceneArtwork() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9ecf8_0%,#eef6f6_38%,#fff4df_100%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 1500 980"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <rect width="1500" height="980" fill="transparent" />
        <rect x="62" y="70" width="320" height="220" rx="48" fill="#ff4f45" opacity="0.9" />
        <rect x="338" y="52" width="360" height="210" rx="48" fill="#ffe04d" opacity="0.92" />
        <rect x="830" y="68" width="420" height="250" rx="60" fill="#bddfff" opacity="0.92" />
        <rect x="1180" y="106" width="230" height="520" rx="44" fill="#fff1d1" opacity="0.96" />
        <rect x="94" y="356" width="520" height="220" rx="40" fill="rgba(255,255,255,0.56)" />
        <rect x="664" y="388" width="360" height="180" rx="34" fill="rgba(255,255,255,0.42)" />
        <rect x="146" y="646" width="390" height="208" rx="38" fill="rgba(255,255,255,0.52)" />
        <rect x="618" y="660" width="514" height="188" rx="38" fill="rgba(255,255,255,0.36)" />
        <path d="M0 316H1500" stroke="rgba(255,255,255,0.34)" strokeWidth="2" />
        <path d="M0 612H1500" stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="absolute left-20 top-24 max-w-[420px]">
        <p className="text-[14px] font-black uppercase tracking-[0.26em] text-neutral-600/85">
          Editorial sans
        </p>
        <h2 className="mt-3 text-[58px] font-semibold tracking-tight text-neutral-950/78">
          The glass should admit the scene underneath.
        </h2>
      </div>

      <div
        className="absolute left-[790px] top-[116px] max-w-[370px] text-[38px] leading-[1.06] text-neutral-900/68"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Liquid layers should feel optical, not chalky.
      </div>

      <div
        className="absolute left-[108px] top-[404px] max-w-[420px] text-[16px] leading-8 text-neutral-700/82"
        style={{ fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace' }}
      >
        effect = transparency + edge + separation
        <br />
        not = white panel + blur
        <br />
        signal = readable background through surface
      </div>

      <div className="absolute right-[108px] bottom-[120px] text-right">
        <p className="text-[18px] font-black uppercase tracking-[0.28em] text-neutral-500/85">
          Synarava
        </p>
        <p className="mt-3 max-w-[280px] text-[15px] leading-7 text-neutral-700/80">
          Move both cards over this area and compare whether the material still feels like glass
          or starts turning into decorative frosting.
        </p>
      </div>
    </>
  );
}

function OpticalRefractionLayer({
  position,
  viewportWidth,
  viewportHeight,
  lensOffset,
}: {
  position: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  lensOffset: { x: number; y: number };
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [border-radius:inherit]"
      style={{
        maskImage:
          "radial-gradient(142% 126% at 50% 46%, black 0%, rgba(0,0,0,0.98) 42%, rgba(0,0,0,0.9) 72%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.2) 97%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(142% 126% at 50% 46%, black 0%, rgba(0,0,0,0.98) 42%, rgba(0,0,0,0.9) 72%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.2) 97%, transparent 100%)",
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left opacity-[0.56] saturate-[1.28]"
        style={{
          width: viewportWidth,
          height: viewportHeight,
          transform: `translate(${-(position.x - 1) + lensOffset.x}px, ${-(position.y - 1) + lensOffset.y}px) scale(1.034)`,
          filter: "url(#lg-displace-strong)",
          transition: "transform 180ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <OpticalSceneArtwork />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.16),rgba(255,255,255,0)_24%),radial-gradient(circle_at_72%_78%,rgba(255,255,255,0.08),rgba(255,255,255,0)_24%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.045),rgba(255,255,255,0)_66%)] opacity-80" />
    </div>
  );
}

function OpticalExperimentLab() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 160, y: 144 });
  const [lensOffset, setLensOffset] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const dragState = useRef<{ offsetX: number; offsetY: number; lastX: number; lastY: number } | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    dragState.current = {
      offsetX: event.clientX - rect.left - position.x,
      offsetY: event.clientY - rect.top - position.y,
      lastX: event.clientX,
      lastY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragState.current;
    if (!viewport || !drag) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const cardWidth = 356;
    const cardHeight = 260;
    const nextX = event.clientX - rect.left - drag.offsetX;
    const nextY = event.clientY - rect.top - drag.offsetY;
    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    setPosition({
      x: Math.max(24, Math.min(rect.width - cardWidth - 24, nextX)),
      y: Math.max(24, Math.min(rect.height - cardHeight - 24, nextY)),
    });
    setLensOffset({
      x: Math.max(-12, Math.min(12, deltaX * 1.15)),
      y: Math.max(-12, Math.min(12, deltaY * 1.15)),
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    setLensOffset({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
          Optical playground
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
          Drag the glass over a loud background
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          This experiment should answer one thing: can we still feel background, typography, and
          color blocks through the glass? Drag the refractive surface around and judge whether it
          feels like one continuous piece of glass instead of a framed translucent card.
        </p>
      </div>

      <div
        ref={viewportRef}
        className="relative h-[780px] overflow-hidden rounded-[42px] border border-black/10 shadow-[0_34px_90px_rgba(15,23,42,0.16)]"
      >
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <defs>
            <filter id="lg-displace-strong" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01 0.016"
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feGaussianBlur in="noise" stdDeviation="0.22" result="softNoise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softNoise"
                scale="18"
                xChannelSelector="R"
                yChannelSelector="B"
              />
            </filter>
          </defs>
        </svg>
        <OpticalSceneArtwork />
        <LiquidGlassSurface
          variant="shellStrong"
          tone="mist"
          effect="amplified"
          className="absolute w-[356px] cursor-grab rounded-[34px] border-transparent bg-white/[0.012] px-6 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.045),0_1px_0_rgba(255,255,255,0.04)_inset] active:cursor-grabbing"
          style={{
            left: position.x,
            top: position.y,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {viewportSize.width > 0 && viewportSize.height > 0 ? (
            <OpticalRefractionLayer
              position={position}
              viewportWidth={viewportSize.width}
              viewportHeight={viewportSize.height}
              lensOffset={lensOffset}
            />
          ) : null}
          <div className="space-y-4 select-none">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Experimental
                </p>
                <h3 className="text-[1.9rem] font-semibold tracking-tight text-neutral-950">
                  Refractive glass
                </h3>
              </div>
              <LiquidGlassSurface variant="control" effect="amplified" className="rounded-full p-3">
                <div className="h-8 w-8 rounded-full border border-black/10 bg-white/16" />
              </LiquidGlassSurface>
            </div>

            <div className="flex gap-3">
              {["Lens", "SVG", "Drag"].map((item) => (
                <LiquidGlassSurface
                  key={item}
                  variant="pill"
                  effect="amplified"
                  className="rounded-full px-4 py-2"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
                    {item}
                  </span>
                </LiquidGlassSurface>
              ))}
            </div>

            <p className="text-sm leading-6 text-neutral-600">
              This version is no longer just transparent blur. It clones and displaces the same
              background underneath, so text and color blocks should feel optically bent inside the
              glass.
            </p>
          </div>
        </LiquidGlassSurface>
      </div>
    </div>
  );
}

function InteractionEventCard({
  event,
  verdict,
  children,
}: {
  event: string;
  verdict: string;
  children: ReactNode;
}) {
  return (
    <LiquidGlassSurface variant="widget" className="rounded-[30px] p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
            {event}
          </p>
          <p className="text-sm leading-6 text-neutral-600">{verdict}</p>
        </div>
        {children}
      </div>
    </LiquidGlassSurface>
  );
}

function DragEventDemo() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [x, setX] = useState(24);
  const draggingRef = useRef(false);

  return (
    <div
      ref={trackRef}
      className="relative h-20 rounded-full border border-black/8 bg-white/20 px-3"
    >
      <div className="absolute inset-x-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#d7e6ef]" />
      <LiquidGlassSurface
        variant="control"
        effect="amplified"
        className="absolute top-1/2 h-14 w-14 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing"
        style={{ left: x }}
        onPointerDown={(event) => {
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current || !trackRef.current) {
            return;
          }

          const rect = trackRef.current.getBoundingClientRect();
          const next = Math.max(12, Math.min(rect.width - 68, event.clientX - rect.left - 28));
          setX(next);
        }}
        onPointerUp={(event) => {
          draggingRef.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={(event) => {
          draggingRef.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
      >
        <div className="flex h-full items-center justify-center text-[11px] font-black uppercase tracking-[0.18em] text-neutral-900">
          Drag
        </div>
      </LiquidGlassSurface>
    </div>
  );
}

function ClickStateDemo() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="space-y-3">
      <LiquidGlassSurface
        variant="pill"
        effect={selected ? "amplified" : "default"}
        className="inline-flex cursor-pointer rounded-full px-5 py-3"
        onClick={() => setSelected((value) => !value)}
      >
        <span className="text-sm font-semibold text-neutral-900">
          {selected ? "Selected state" : "Click to toggle"}
        </span>
      </LiquidGlassSurface>
      <p className="text-xs leading-5 text-neutral-500">
        Click is not the base liquid reaction. It is for persistent UI state after the hover/press
        language has already done its job.
      </p>
    </div>
  );
}

function BaseEventsLab() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
          Event map
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
          Base liquid events
        </h1>
        <p className="max-w-4xl text-sm leading-6 text-neutral-600">
          This page should answer a simple question: which interactions define the base language?
          For us the core is hover, press, and focus. Drag belongs only to draggable objects. Click
          is a state change, not the main glass animation.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <InteractionEventCard
          event="Hover"
          verdict="Primary base motion. The surface should breathe, soften, and expand a little without jumping upward."
        >
          <LiquidGlassSurface
            variant="pill"
            animation="breathe"
            animationTrigger="hover"
            className="inline-flex rounded-full px-5 py-3"
          >
            <span className="text-sm font-semibold text-neutral-900">Hover me</span>
          </LiquidGlassSurface>
        </InteractionEventCard>

        <InteractionEventCard
          event="Press"
          verdict="Secondary physical feedback. It should confirm contact quickly, then get out of the way."
        >
          <LiquidGlassSurface
            variant="control"
            animation="press"
            animationTrigger="tap"
            className="inline-flex rounded-full px-5 py-3"
          >
            <span className="text-sm font-semibold text-neutral-900">Press me</span>
          </LiquidGlassSurface>
        </InteractionEventCard>

        <InteractionEventCard
          event="Focus"
          verdict="For inputs only. Focus should feel precise and calm, not like a glowing alert."
        >
          <GlassInput
            label="Focus input"
            placeholder="Click or tab into this field"
            helperText="Focus is part of the base liquid language for form controls."
          />
        </InteractionEventCard>

        <InteractionEventCard
          event="Drag"
          verdict="Only for movable objects. The material can react while moving, but drag is not a universal base interaction."
        >
          <DragEventDemo />
        </InteractionEventCard>
      </div>

      <InteractionEventCard
        event="Click"
        verdict="Useful for toggling selected or open state, but not the main way we demonstrate liquid behavior."
      >
        <ClickStateDemo />
      </InteractionEventCard>
    </div>
  );
}

function ThemeVariantStage({
  title,
  subtitle,
  theme,
}: {
  title: string;
  subtitle: string;
  theme: "light" | "dark";
}) {
  const dark = theme === "dark";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[40px] border p-8 shadow-[0_30px_80px_rgba(15,23,42,0.16)]",
        dark ? "border-white/10 bg-[#0d1420]" : "border-black/8 bg-[#d9ebf7]",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0",
          dark
            ? "bg-[radial-gradient(circle_at_top_left,rgba(255,209,77,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,158,255,0.14),transparent_26%),linear-gradient(180deg,#0f1827_0%,#152336_48%,#0f1621_100%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(255,222,94,0.26),transparent_24%),radial-gradient(circle_at_top_right,rgba(159,205,255,0.24),transparent_26%),linear-gradient(180deg,#d8ebf7_0%,#edf6f8_46%,#f8f4ea_100%)]",
        ].join(" ")}
      />
      <div
        className={[
          "absolute inset-0 opacity-40",
          dark
            ? "[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]"
            : "[background-image:linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)]",
          "[background-size:30px_30px]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute right-10 top-10 text-right text-[72px] font-semibold tracking-tight opacity-20",
          dark ? "text-white" : "text-neutral-700",
        ].join(" ")}
      >
        glass
      </div>

      <div className="relative z-[1] space-y-6">
        <div className="space-y-2">
          <p
            className={[
              "text-xs font-black uppercase tracking-[0.24em]",
              dark ? "text-white/50" : "text-neutral-500",
            ].join(" ")}
          >
            {title}
          </p>
          <p
            className={[
              "max-w-xl text-sm leading-6",
              dark ? "text-white/72" : "text-neutral-600",
            ].join(" ")}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <LiquidGlassSurface variant="shellStrong" className="rounded-[34px] px-6 py-5">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
                    Shell
                  </p>
                  <h2 className="text-[2rem] font-semibold tracking-tight text-neutral-950">
                    Visit All
                  </h2>
                </div>
                <LiquidGlassSurface variant="control" className="rounded-full p-3">
                  <div className="h-8 w-8 rounded-full border border-black/10 bg-white/20" />
                </LiquidGlassSurface>
              </div>

              <div className="flex flex-wrap gap-3">
                {["Pins", "Paths", "Zones"].map((item, index) => (
                  <LiquidGlassSurface
                    key={item}
                    variant={index === 0 ? "control" : "pill"}
                    className="rounded-full px-5 py-3"
                  >
                    <span className="text-sm font-semibold text-neutral-900">{item}</span>
                  </LiquidGlassSurface>
                ))}
              </div>

              <LiquidGlassSurface variant="widget" className="rounded-[28px] p-5">
                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    Widget
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-neutral-950">
                    Inner surface
                  </p>
                  <p className="text-sm leading-6 text-neutral-600">
                    This layer should step down from the outer shell without turning into a flat
                    white card.
                  </p>
                </div>
              </LiquidGlassSurface>
            </div>
          </LiquidGlassSurface>

          <div className="grid gap-4">
            <LiquidGlassSurface variant="widget" className="rounded-[30px] p-5">
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  Pill
                </p>
                <LiquidGlassSurface variant="pill" className="inline-flex rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-neutral-900">Quiet filter</span>
                </LiquidGlassSurface>
              </div>
            </LiquidGlassSurface>

            <LiquidGlassSurface variant="widget" className="rounded-[30px] p-5">
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  Control
                </p>
                <LiquidGlassSurface variant="control" className="inline-flex rounded-[22px] px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-900">Primary action</span>
                </LiquidGlassSurface>
              </div>
            </LiquidGlassSurface>

            <LiquidGlassSurface variant="widget" className="rounded-[30px] p-5">
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  Inset
                </p>
                <LiquidGlassSurface variant="inset" className="rounded-[24px] px-4 py-4">
                  <span className="text-sm text-neutral-600">Search collections, places, stories…</span>
                </LiquidGlassSurface>
              </div>
            </LiquidGlassSurface>
          </div>
        </div>
      </div>
    </div>
  );
}

function HoverCard({
  title,
  description,
  variant = "pill",
}: {
  title: string;
  description: string;
  variant?: "pill" | "control" | "widget";
}) {
  const [active, setActive] = useState(false);
  const isWidget = variant === "widget";

  return (
    <motion.button
      type="button"
      onClick={() => setActive((value) => !value)}
      whileHover={isWidget ? { y: -8, scale: 1.012 } : { y: -3, scale: 1.016 }}
      whileTap={isWidget ? { scale: 0.994, y: 1 } : { scale: 0.982, y: 1.5 }}
      animate={active ? (isWidget ? { y: -10, scale: 1.016 } : { y: -2, scale: 1.012 }) : { y: 0, scale: 1 }}
      transition={active ? liquidGlassPressTransition : liquidGlassHoverTransition}
      className="group text-left"
    >
      <LiquidGlassSurface
        variant={variant}
        className={`relative w-full ${isWidget ? "rounded-[30px] p-6" : "rounded-[24px] px-5 py-4"}`}
      >
        <motion.div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${isWidget ? "rounded-[30px]" : "rounded-[24px]"} bg-[linear-gradient(108deg,transparent_18%,rgba(255,255,255,0.18)_42%,transparent_66%)]`}
          animate={{
            x: active ? ["-26%", "14%"] : "-22%",
            opacity: active ? [0.08, 0.24, 0.08] : 0.08,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <div className="relative z-[1] space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
            {title}
          </p>
          <p className={`${isWidget ? "text-2xl" : "text-lg"} font-semibold tracking-tight text-neutral-950`}>
            {variant === "widget" ? "Widget hover" : variant === "control" ? "Control hover" : "Pill hover"}
          </p>
          <p className="text-sm leading-6 text-neutral-600">{description}</p>
          {isWidget ? (
            <div className="pt-2">
              <LiquidGlassSurface variant="pill" className="inline-flex rounded-full px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">
                  Hover or tap
                </span>
              </LiquidGlassSurface>
            </div>
          ) : null}
        </div>
      </LiquidGlassSurface>
    </motion.button>
  );
}

export const PremiumScenes: Story = {
  render: () => (
    <div className="min-h-screen bg-[linear-gradient(180deg,#dbe9f2_0%,#edf4f6_45%,#f6f5ef_100%)] p-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
            Synarava Liquid Glass
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-950">
            Light and dark glass variants
          </h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            This page should answer one question only: how the same glass system behaves in light
            and dark themes. No moodboard noise, just the core material variants in comparable
            scenes.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <ThemeVariantStage
            title="Light theme"
            subtitle="Brighter backgrounds should still let the shell hierarchy read clearly."
            theme="light"
          />
          <ThemeVariantStage
            title="Dark theme"
            subtitle="Darker backgrounds should keep the same hierarchy without turning the material into gray plastic."
            theme="dark"
          />
        </div>

        <SceneFrame className="p-7">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                Motion tokens
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-950">
                Motion should feel tactile, not playful.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Shell", value: liquidGlassMotion.shell },
                { label: "Section", value: liquidGlassMotion.section },
                { label: "Press", value: liquidGlassMotion.press },
              ].map(({ label, value }) => (
                <LiquidGlassSurface
                  key={label}
                  variant="widget"
                  className="rounded-[28px] p-5"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                    {label}
                  </p>
                  <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-neutral-700">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </LiquidGlassSurface>
              ))}
            </div>
          </div>
        </SceneFrame>
      </div>
    </div>
  ),
};

export const InteractiveBackgroundLab: Story = {
  render: () => (
    <div className="min-h-screen bg-[linear-gradient(180deg,#dbe9f2_0%,#edf4f6_45%,#f6f5ef_100%)] p-10">
      <div className="mx-auto max-w-7xl">
        <InteractiveGlassLab />
      </div>
    </div>
  ),
};

export const HoverLab: Story = {
  render: () => (
    <div className="min-h-screen bg-[linear-gradient(180deg,#d6ebf7_0%,#e9f5f7_44%,#faf4e8_100%)] p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
            Hover lab
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-950">
            Hover should feel expensive, not busy
          </h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            The real liquid motion layer starts with hover. We want lift, highlight drift, and
            gentle pressure, not a demo-reel animation.
          </p>
        </div>

        <SceneFrame className="p-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <HoverCard
              title="Shell"
              description="Large surfaces should lift gently and keep their mass."
              variant="widget"
            />
            <HoverCard
              title="Control"
              description="Buttons should answer the cursor with pressure and clarity."
              variant="control"
            />
            <HoverCard
              title="Pill"
              description="Filters and tabs need a softer hover than buttons."
              variant="pill"
            />
            <HoverCard
              title="Widget"
              description="Sections inside inspectors should feel alive without stealing attention."
              variant="widget"
            />
          </div>
        </SceneFrame>
      </div>
    </div>
  ),
};

export const FocusLab: Story = {
  render: () => (
    <div className="min-h-screen bg-[linear-gradient(180deg,#d6ebf7_0%,#e9f5f7_44%,#faf4e8_100%)] p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
            Focus lab
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-950">
            Focus should be the first real input signal
          </h1>
          <p className="max-w-3xl text-base leading-7 text-neutral-600">
            Hover is optional on some devices. Focus is not. So the material system needs a real,
            reusable input primitive before we call the animation layer ready.
          </p>
        </div>

        <SceneFrame className="p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <LiquidGlassSurface variant="shellStrong" className="rounded-[34px] p-7">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
                    Search shell
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-neutral-950">
                    Inputs should focus calmly
                  </h2>
                </div>
                <GlassInput
                  label="Search"
                  helperText="Suitable for shell search and command surfaces."
                  placeholder="Search collections, places, stories..."
                  prefix={<Search size={18} strokeWidth={2} />}
                  tone="mist"
                />
                <GlassInput
                  label="Inline title"
                  helperText="Useful for entity names and compact edit surfaces."
                  placeholder="Untitled marker"
                  prefix={<Sparkles size={18} strokeWidth={2} />}
                />
                <GlassInput
                  label="Settings"
                  helperText="A warmer tone can be reserved for inspector-specific inputs."
                  placeholder="Background style"
                  prefix={<SlidersHorizontal size={18} strokeWidth={2} />}
                  tone="cream"
                />
              </div>
            </LiquidGlassSurface>

            <LiquidGlassSurface variant="widget" className="rounded-[34px] p-7">
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Principle
                </p>
                <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                  Focus is where liquid motion starts to matter.
                </p>
                <p className="text-sm leading-6 text-neutral-600">
                  We do not need a loud glow. We need a precise, confident focus state that feels
                  tactile and reusable inside shells and widgets.
                </p>
                <div className="grid gap-3 pt-2">
                  {[
                    "No heavy glow",
                    "No jumpy transform",
                    "Readable caret area",
                    "Reusable in shell and widgets",
                  ].map((item) => (
                    <LiquidGlassSurface
                      key={item}
                      variant="pill"
                      className="rounded-full px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-neutral-800">{item}</span>
                    </LiquidGlassSurface>
                  ))}
                </div>
              </div>
            </LiquidGlassSurface>
          </div>
        </SceneFrame>
      </div>
    </div>
  ),
};

function ToneBackdropSample({
  variant,
  tone,
  effect = "default",
}: {
  variant: "shell" | "shellStrong" | "widget" | "pill" | "control" | "inset";
  tone: "neutral" | "mist" | "cream" | "rose";
  effect?: "default" | "amplified";
}) {
  const backdropByTone = {
    neutral: {
      shell: "bg-[linear-gradient(135deg,#f5f7f8_0%,#dce9f5_52%,#f6f2e8_100%)]",
      accent: "bg-[#eef3f7]",
      line: "bg-[#c8d8e6]",
      label: "Neutral backdrop",
    },
    mist: {
      shell: "bg-[linear-gradient(135deg,#dff1ff_0%,#b7ddff_54%,#edf8ff_100%)]",
      accent: "bg-[#cde8ff]",
      line: "bg-[#7fbaf0]",
      label: "Cool mist backdrop",
    },
    cream: {
      shell: "bg-[linear-gradient(135deg,#fff2c5_0%,#ffe8a2_54%,#fff7dd_100%)]",
      accent: "bg-[#ffe48b]",
      line: "bg-[#e9c856]",
      label: "Warm cream backdrop",
    },
    rose: {
      shell: "bg-[linear-gradient(135deg,#ffd8de_0%,#ffc2d1_54%,#fff0f4_100%)]",
      accent: "bg-[#ffb8c7]",
      line: "bg-[#ef7f9a]",
      label: "Soft rose backdrop",
    },
  } as const;

  const backdrop = backdropByTone[tone];

  return (
    <div className={`relative overflow-hidden rounded-[32px] border border-black/8 p-5 ${backdrop.shell}`}>
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className={`absolute left-6 top-6 h-24 w-32 rounded-[24px] ${backdrop.accent} opacity-82 blur-[1px]`} />
      <div className={`absolute right-8 top-9 h-20 w-40 rounded-[28px] ${backdrop.accent} opacity-38`} />
      <div className={`absolute left-8 bottom-10 h-2.5 w-36 rounded-full ${backdrop.line} opacity-55`} />
      <div className={`absolute left-8 bottom-16 h-2.5 w-20 rounded-full ${backdrop.line} opacity-35`} />
      <div className="absolute right-5 bottom-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500/80">
        {backdrop.label}
      </div>

      <LiquidGlassSurface
        variant={variant}
        tone={tone}
        effect={effect}
        className="relative z-[1] rounded-[30px] p-5"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
          {tone}
        </p>
        <p className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">Sample surface</p>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          This should read as tinted glass, not a colored card.
        </p>
      </LiquidGlassSurface>
    </div>
  );
}

export const MaterialMatrix: Story = {
  render: () => {
    const variants = ["shell", "shellStrong", "widget", "pill", "control", "inset"] as const;
    const tones = ["neutral", "mist", "cream", "rose"] as const;

    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#dbe9f2_0%,#edf4f6_45%,#f6f5ef_100%)] p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
              Matrix
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
              Variants and tones
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-neutral-600">
              These are supporting references, not the main proof. The package succeeds only when
              it looks correct in scene-based stories.
            </p>
          </div>

          <div className="grid gap-6">
            {variants.map((variant) => (
              <div key={variant} className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900">{variant}</h2>
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                  {tones.map((tone) => (
                    <ToneBackdropSample key={`${variant}-${tone}`} variant={variant} tone={tone} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const OpticalExperiment: Story = {
  render: () => (
    <div className="min-h-screen bg-[linear-gradient(180deg,#dbe9f2_0%,#edf4f6_45%,#f6f5ef_100%)] p-10">
      <div className="mx-auto max-w-7xl">
        <OpticalExperimentLab />
      </div>
    </div>
  ),
};

export const BaseEvents: Story = {
  render: () => (
    <div className="min-h-screen bg-[linear-gradient(180deg,#dbe9f2_0%,#edf4f6_45%,#f6f5ef_100%)] p-10">
      <div className="mx-auto max-w-7xl">
        <BaseEventsLab />
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Refractive Glass — SVG displacement-map refraction
// ---------------------------------------------------------------------------

function RefractiveScene() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden p-10"
      style={{
        background: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg') center center / cover",
      }}
    >
      <GlassFilterDefs />

      <p className="text-center text-sm font-medium text-white/70 uppercase tracking-widest">
        SVG displacement-map refraction · refractive=true
      </p>

      {/* Pills */}
      <div className="flex flex-wrap gap-4 justify-center">
        {["New file", "Open file", "Settings", "Repository"].map((label) => (
          <LiquidGlassSurface
            key={label}
            refractive
            className="rounded-full px-5 py-2.5 cursor-pointer"
          >
            <span className="text-sm font-semibold text-white">{label}</span>
          </LiquidGlassSurface>
        ))}
      </div>

      {/* Widget card */}
      <LiquidGlassSurface refractive className="rounded-[28px] p-6 w-72">
        <h2 className="text-xl font-bold text-white mb-2">Liquid Glass</h2>
        <p className="text-sm text-white/70">
          Real pixel-level refraction via SVG feTurbulence + feDisplacementMap.
          No flat tint — actual glass distortion.
        </p>
      </LiquidGlassSurface>

      {/* Dock */}
      <LiquidGlassSurface refractive className="rounded-[2rem] px-4 py-3">
        <div className="flex items-center gap-4">
          {["🗺️", "🔍", "⚙️", "📍", "🌐"].map((icon, i) => (
            <div
              key={i}
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl cursor-pointer transition-transform hover:scale-110"
            >
              {icon}
            </div>
          ))}
        </div>
      </LiquidGlassSurface>
    </div>
  );
}

export const RefractiveGlass: Story = {
  name: "Refractive Glass (SVG filter)",
  render: () => <RefractiveScene />,
};

// ---------------------------------------------------------------------------
// Filter Comparison — turbulence vs self-displacement vs simple blur
// + organic border-radius + drift background
// ---------------------------------------------------------------------------

function FilterComparisonScene() {
  useEffect(() => { injectDriftKeyframes(); }, []);

  const BG_URL =
    "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg";

  const cards = [
    {
      label: "Simple blur",
      sub: "backdrop-filter: blur(14px)",
      style: {
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        backgroundColor: "rgba(192,192,194,0.04)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,9%), inset 1.8px 3px 0 -2px rgba(255,255,255,72%), inset -0.3px -1px 4px 0 rgba(0,0,0,8%), 0 8px 24px rgba(0,0,0,8%)",
      },
      filter: "none",
    },
    {
      label: "Turbulence",
      sub: "blur → url(#lg-refract) → saturate",
      style: {
        backdropFilter: "blur(6px) url(#lg-refract) saturate(140%)",
        WebkitBackdropFilter: "blur(6px) saturate(140%)",
        backgroundColor: "rgba(192,192,194,0.04)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,9%), inset 1.8px 3px 0 -2px rgba(255,255,255,72%), inset -0.3px -1px 4px 0 rgba(0,0,0,8%), 0 8px 24px rgba(0,0,0,8%)",
      },
    },
    {
      label: "Self-warp",
      sub: "url(#lg-refract-self) — backdrop warps itself",
      style: {
        backdropFilter: "url(#lg-refract-self)",
        WebkitBackdropFilter: "blur(3px)",
        backgroundColor: "rgba(192,192,194,0.05)",
        boxShadow:
          "inset 2px 2px 1px 0 rgba(255,255,255,30%), inset -2px -2px 2px 1px rgba(255,255,255,30%), 0 4px 8px rgba(0,0,0,20%), 0 6px 20px rgba(0,0,0,20%)",
      },
    },
  ] as const;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-12 overflow-hidden p-10"
      style={{
        backgroundImage: `url('${BG_URL}')`,
        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
        animation: "lg-drift 60s ease-in-out infinite alternate",
      }}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/60">
        Filter comparison · organic radius · drift background
      </p>

      {/* Three filter variants side by side */}
      <div className="flex flex-wrap gap-8 justify-center">
        {cards.map(({ label, sub, style }) => (
          <motion.div
            key={label}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer px-8 py-6"
            style={{
              ...style,
              borderRadius: glassRadius(22),
              transition: "border-radius 400ms cubic-bezier(0.2,0.9,0.3,1.5), transform 300ms cubic-bezier(0.2,0.9,0.3,1.5)",
            }}
            whileHover={{
              scale: 1.05,
              borderRadius: glassRadius(22, true),
            }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="text-base font-semibold text-white">{label}</span>
            <span className="text-xs text-white/60 text-center max-w-[160px]">{sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Organic radius demo */}
      <div className="flex flex-wrap gap-6 justify-center">
        {([16, 24, 32] as const).map((r) => (
          <motion.div
            key={r}
            className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white"
            style={{
              backdropFilter: "blur(10px) url(#lg-refract) saturate(140%)",
              WebkitBackdropFilter: "blur(10px) saturate(140%)",
              backgroundColor: "rgba(192,192,194,0.04)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,9%), inset 1.8px 3px 0 -2px rgba(255,255,255,60%), 0 4px 16px rgba(0,0,0,8%)",
              borderRadius: glassRadius(r),
            }}
            whileHover={{ borderRadius: glassRadius(r, true), scale: 1.04 }}
            transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1.5] }}
          >
            radius={r}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const FilterComparison: Story = {
  name: "Filter Comparison + Organic Radius",
  render: () => <FilterComparisonScene />,
};

// ---------------------------------------------------------------------------
// GlassControl — lens-based interactive glass element
// Shows: 3-layer reveal, chromatic specular, lens distortion, squish press
// ---------------------------------------------------------------------------

function GlassControlScene() {
  const [sliderValue, setSliderValue] = useState(40);
  const isDragging = useRef(false);

  const accents = [
    { color: "#49a3fc", label: "Blue" },
    { color: "#ff48a9", label: "Rose" },
    { color: "#34d399", label: "Mint" },
    { color: "#f59e0b", label: "Amber" },
  ];

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-16 p-12"
      style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)",
      }}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Glass Control — lens filter · 3-layer reveal · chromatic specular
      </p>

      {/* Accent color variants */}
      <div className="flex flex-wrap gap-6 justify-center">
        {accents.map(({ color, label }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <GlassControl
              accentColor={color}
              className="rounded-full px-8 py-4"
            >
              <span className="text-sm font-semibold text-neutral-700">{label}</span>
            </GlassControl>
            <span className="text-xs text-neutral-400">{label} accent</span>
          </div>
        ))}
      </div>

      {/* Glass slider thumb demo */}
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs text-neutral-400 uppercase tracking-widest">
          Glass Slider — hover/drag the thumb
        </span>
        <div className="relative flex items-center" style={{ width: 320, height: 42 }}>
          {/* Track */}
          <div
            className="absolute w-full rounded-full"
            style={{ height: 10, background: "#D6D6DA" }}
          />
          {/* Progress */}
          <div
            className="absolute rounded-full"
            style={{
              height: 10,
              width: `${sliderValue}%`,
              background: "linear-gradient(117deg, #49a3fc 0%, #3681ee 100%)",
            }}
          />
          {/* Glass thumb */}
          <GlassControl
            accentColor="#49a3fc"
            className="rounded-full"
            style={{
              position: "absolute",
              left: `${sliderValue}%`,
              transform: "translate(-50%, 0)",
              width: 65,
              height: 42,
              cursor: "grab",
              touchAction: "none",
            }}
            pressScale="scaleY(0.97) scaleX(1.10)"
            onPointerDown={(e) => {
              isDragging.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!isDragging.current) return;
              const track = e.currentTarget.parentElement!;
              const rect = track.getBoundingClientRect();
              const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              setSliderValue(pct);
            }}
            onPointerUp={() => {
              isDragging.current = false;
            }}
            onPointerCancel={() => {
              isDragging.current = false;
            }}
          >
            <div style={{ width: 65, height: 42 }} />
          </GlassControl>
        </div>
        <span className="text-sm font-semibold tabular-nums text-neutral-500">
          {Math.round(sliderValue)}%
        </span>
      </div>

      {/* Size variants */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {[
          { label: "Small", w: 48, h: 28, r: 999 },
          { label: "Medium", w: 80, h: 44, r: 999 },
          { label: "Large", w: 120, h: 56, r: 16 },
          { label: "Square", w: 56, h: 56, r: 16 },
        ].map(({ label, w, h, r }) => (
          <GlassControl
            key={label}
            accentColor="#49a3fc"
            className="flex items-center justify-center"
            style={{ width: w, height: h, borderRadius: r }}
          >
            <span className="text-xs font-medium text-neutral-500">{label}</span>
          </GlassControl>
        ))}
      </div>
    </div>
  );
}

export const GlassControlDemo: Story = {
  name: "Glass Control (Lens + 3-Layer)",
  render: () => <GlassControlScene />,
};
