"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus } from "lucide-react";

import { GlassFilterDefs, LiquidGlassSurface, type LiquidGlassTone } from "../src";

interface PaintedArgs {
  tone: LiquidGlassTone;
  transparency: number;
  shineIntensity: number;
  paneOpacity: number;
  paneContrast: number;
}

function PaintedGlassButton({
  tone,
  transparency,
  shineIntensity,
  paneOpacity,
  paneContrast,
}: PaintedArgs) {
  const paneMix = Math.round(58 + paneContrast * 28);
  const paneGlassOverlay = "radial-gradient(90% 75% at 50% 0%, rgba(255,255,255,0.34), rgba(255,255,255,0) 58%), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.08) 100%)";
  const paintedBars = (
    <div className="relative grid h-full w-full grid-cols-2 grid-rows-2 overflow-hidden rounded-l-[28px]">
      <div
        className="relative"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, #ff1206 ${paneMix}%, white), color-mix(in srgb, #b80800 ${paneMix}%, white))`,
          opacity: paneOpacity,
        }}
      >
        <div className="absolute inset-0" style={{ background: paneGlassOverlay }} />
      </div>
      <div
        className="relative"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, #ffe800 ${paneMix}%, white), color-mix(in srgb, #d8a800 ${paneMix}%, white))`,
          opacity: paneOpacity,
        }}
      >
        <div className="absolute inset-0" style={{ background: paneGlassOverlay }} />
      </div>
      <div
        className="relative"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, #1428ff ${paneMix}%, white), color-mix(in srgb, #0e1ca3 ${paneMix}%, white))`,
          opacity: paneOpacity,
        }}
      >
        <div className="absolute inset-0" style={{ background: paneGlassOverlay }} />
      </div>
      <div
        className="relative"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, #fff16b ${paneMix}%, white), color-mix(in srgb, #e7c712 ${paneMix}%, white))`,
          opacity: paneOpacity,
        }}
      >
        <div className="absolute inset-0" style={{ background: paneGlassOverlay }} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/45" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/28" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/10" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_1px_1px_0_rgba(255,255,255,0.22),inset_-1px_-1px_0_rgba(0,0,0,0.08)]" />
    </div>
  );

  return (
    <LiquidGlassSurface
      variant="widget"
      tone={tone}
      effect="amplified"
      transparency={transparency}
      shineIntensity={shineIntensity}
      refractive
      className="rounded-[28px] shadow-[0_22px_60px_rgba(0,0,0,0.1)]"
      materialStyle={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,246,241,0.84) 100%)",
      }}
    >
      <button
        type="button"
        className="group relative flex h-[150px] w-full overflow-hidden rounded-[28px] text-left"
      >
        <div className="relative w-[96px] shrink-0">{paintedBars}</div>

        <div
          className="relative flex w-[96px] shrink-0 items-center justify-center border-x border-black/10"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, #fff16b ${paneMix}%, white), color-mix(in srgb, #e7c712 ${paneMix}%, white))`,
            opacity: paneOpacity,
          }}
        >
          <div className="absolute inset-0" style={{ background: paneGlassOverlay }} />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_1px_1px_0_rgba(255,255,255,0.26),inset_-1px_-1px_0_rgba(0,0,0,0.08)]" />
          <Plus className="relative z-[1] h-10 w-10 text-black" strokeWidth={2.2} />
        </div>

        <div className="relative flex min-w-0 flex-1 items-center px-8">
          <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_18%_0%,rgba(255,255,255,0.4),rgba(255,255,255,0)_46%)]" />
          <span className="relative z-[1] text-[34px] font-black uppercase tracking-[-0.04em] text-neutral-950">
            New Layer
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(0,0,0,0.06)]" />
      </button>
    </LiquidGlassSurface>
  );
}

function PaintedSurfaceDemo(args: PaintedArgs) {
  const paneMix = Math.round(58 + args.paneContrast * 28);

  return (
    <div className="relative min-h-screen overflow-hidden px-10 py-12 md:px-14">
      <GlassFilterDefs />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #f5ece1 0%, #f6d7cb 18%, #f7f0dd 36%, #e5eef9 58%, #f0ead6 82%, #f7f6f1 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-55">
        <div className="absolute left-[8%] top-[10%] h-56 w-56 rounded-full bg-[#ff2a00]/14 blur-[50px]" />
        <div className="absolute right-[16%] top-[22%] h-64 w-64 rounded-full bg-[#ffe800]/16 blur-[58px]" />
        <div className="absolute bottom-[18%] left-[14%] h-72 w-72 rounded-full bg-[#1740ff]/14 blur-[62px]" />
      </div>

      <div className="relative z-[1] mx-auto flex max-w-[1280px] flex-col gap-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-neutral-500">
            Material Study
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
            Painted Glass Button
          </h1>
          <p className="mt-3 text-base leading-7 text-neutral-600">
            Native liquid glass stays intact. The color identity comes from painted internal panes,
            not from replacing the material itself.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
          <div className="space-y-6">
            <PaintedGlassButton {...args} />

            <div className="grid gap-4 md:grid-cols-2">
              <LiquidGlassSurface
                variant="widget"
                tone="rose"
                effect="amplified"
                transparency={args.transparency}
                shineIntensity={args.shineIntensity}
                refractive
                className="rounded-[26px]"
              >
                <div className="space-y-3 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                    Warm Accent
                  </p>
                  <div
                    className="h-24 rounded-[20px]"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, #ff4560 ${paneMix}%, white), color-mix(in srgb, #ffbccb ${paneMix}%, white))`,
                      opacity: args.paneOpacity,
                    }}
                  />
                </div>
              </LiquidGlassSurface>

              <LiquidGlassSurface
                variant="widget"
                tone="mist"
                effect="amplified"
                transparency={args.transparency}
                shineIntensity={args.shineIntensity}
                refractive
                className="rounded-[26px]"
              >
                <div className="space-y-3 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                    Cool Accent
                  </p>
                  <div
                    className="h-24 rounded-[20px]"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, #3b88ff ${paneMix}%, white), color-mix(in srgb, #c4e8ff ${paneMix}%, white))`,
                      opacity: args.paneOpacity,
                    }}
                  />
                </div>
              </LiquidGlassSurface>
            </div>
          </div>

          <LiquidGlassSurface
            variant="widget"
            tone={args.tone}
            effect="amplified"
            transparency={args.transparency}
            shineIntensity={args.shineIntensity}
            refractive
            className="rounded-[30px]"
          >
            <div className="space-y-5 p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Dial In
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  Native Glass, Painted Interior
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  This keeps the existing Synarava glass system and only adjusts the chroma inside
                  the control.
                </p>
              </div>

              <div className="rounded-[22px] bg-white/45 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  Live Values
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  transparency {args.transparency.toFixed(2)} · shine {args.shineIntensity.toFixed(2)} · pane opacity {args.paneOpacity.toFixed(2)} · pane contrast {args.paneContrast.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[20px] bg-white/45 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    Goal
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-800">Our glass, just painted brighter</p>
                </div>
                <div className="rounded-[20px] bg-white/45 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    Use Case
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-800">Colorful CTA buttons and accents</p>
                </div>
              </div>
            </div>
          </LiquidGlassSurface>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Liquid Glass / Stained Surface",
  component: PaintedSurfaceDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta<typeof PaintedSurfaceDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    tone: "cream",
    transparency: 0.1,
    shineIntensity: 1,
    paneOpacity: 0.92,
    paneContrast: 0.88,
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "mist", "cream", "rose"],
    },
    transparency: {
      control: { type: "range", min: 0, max: 0.45, step: 0.01 },
    },
    shineIntensity: {
      control: { type: "range", min: 0, max: 1.4, step: 0.02 },
    },
    paneOpacity: {
      control: { type: "range", min: 0.3, max: 1, step: 0.01 },
    },
    paneContrast: {
      control: { type: "range", min: 0, max: 1, step: 0.02 },
    },
  },
  render: (args) => <PaintedSurfaceDemo {...args} />,
};
