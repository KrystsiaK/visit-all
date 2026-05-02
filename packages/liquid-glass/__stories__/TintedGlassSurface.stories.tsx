"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TintedGlassSurface, GlassFilterDefs, type LiquidGlassTone } from "../src";

interface TintedSurfaceArgs {
  tone: LiquidGlassTone;
  transparency: number;
  tintStrength: number;
  blurPx: number;
  shineIntensity: number;
  title: string;
  subtitle: string;
}

function TintedSurfaceDemo({
  tone,
  transparency,
  tintStrength,
  blurPx,
  shineIntensity,
  title,
  subtitle,
}: TintedSurfaceArgs) {
  return (
    <div className="relative min-h-screen overflow-hidden p-10 md:p-14">
      <GlassFilterDefs />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #f3efe6 0%, #efe6d4 18%, #f2d3c2 36%, #d7d8f7 56%, #d1e8f7 78%, #eef3f8 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="grid w-[86%] grid-cols-3 gap-6 opacity-80">
          <div className="rounded-[34px] bg-[rgba(255,255,255,0.42)] p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
              Atmosphere
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">Mist Layer</p>
          </div>
          <div className="rounded-[34px] bg-[rgba(255,209,102,0.42)] p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
              Highlight
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">Warm Tint</p>
          </div>
          <div className="rounded-[34px] bg-[rgba(114,163,255,0.34)] p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-neutral-500">
              Field
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">Blue Plane</p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center">
        <p className="text-[180px] font-black tracking-[-0.08em] text-white/35">
          TINT
        </p>
      </div>

      <div className="relative z-[1] mx-auto flex max-w-[1200px] flex-col gap-10">
        <div className="max-w-xl">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-neutral-500">
            Widget Library Material
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
            Tinted Glass Surface
          </h1>
          <p className="mt-3 text-base leading-7 text-neutral-600">
            A stronger-tint, lower-blur material for library previews where color identity matters
            more than heavy glass distortion.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <TintedGlassSurface
            tone={tone}
            transparency={transparency}
            tintStrength={tintStrength}
            blurPx={blurPx}
            shineIntensity={shineIntensity}
            className="rounded-[30px] shadow-[0_22px_70px_rgba(0,0,0,0.08)]"
          >
            <div className="space-y-5 p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {subtitle}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                  Live Values
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  transparency {transparency.toFixed(2)} · tint {tintStrength.toFixed(2)} · blur {blurPx}px · shine {shineIntensity.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-white/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    Tone
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-800">{tone}</p>
                </div>
                <div className="rounded-[22px] bg-white/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    Tint Strength
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-800">{tintStrength.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </TintedGlassSurface>

          <div className="grid gap-5 md:grid-cols-2">
            {(["neutral", "mist", "cream", "rose"] as const).map((sampleTone) => (
              <TintedGlassSurface
                key={sampleTone}
                tone={sampleTone}
                transparency={transparency}
                tintStrength={tintStrength}
                blurPx={blurPx}
                shineIntensity={shineIntensity}
                className="rounded-[28px] shadow-[0_18px_50px_rgba(0,0,0,0.07)]"
              >
                <div className="space-y-4 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    {sampleTone}
                  </p>
                  <div className="h-20 rounded-[22px] bg-white/45" />
                </div>
              </TintedGlassSurface>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Liquid Glass / Tinted Surface",
  component: TintedSurfaceDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta<typeof TintedSurfaceDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    tone: "mist",
    transparency: 0.18,
    tintStrength: 0.62,
    blurPx: 8,
    shineIntensity: 0.72,
    title: "Library Widget",
    subtitle: "A more color-present material that still feels premium and calm.",
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "mist", "cream", "rose"],
    },
    transparency: {
      control: { type: "range", min: 0, max: 0.6, step: 0.02 },
    },
    tintStrength: {
      control: { type: "range", min: 0, max: 1, step: 0.02 },
    },
    blurPx: {
      control: { type: "range", min: 0, max: 28, step: 1 },
    },
    shineIntensity: {
      control: { type: "range", min: 0, max: 1, step: 0.02 },
    },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  render: (args) => <TintedSurfaceDemo {...args} />,
};
