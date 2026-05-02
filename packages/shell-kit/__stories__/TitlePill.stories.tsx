"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { motion } from "framer-motion";
import { GlassFilterDefs } from "@synarava/liquid-glass";

import { CompactTitlePill, TitlePill } from "../src";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Shell Kit/TitlePill",
  component: InteractiveDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta<typeof InteractiveDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Interactive Story — Dark Background with Typography
// ---------------------------------------------------------------------------

interface PlaygroundArgs {
  eyebrow: string;
  title: string;
  subtitle: string;
  label: string;
  width: number;
  expandedMaxWidth: number;
  compact: boolean;
}

function InteractiveDemo(args: PlaygroundArgs) {
  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <GlassFilterDefs />

      {/* Dark gradient background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #0c1a2e 70%, #18181b 100%)",
      }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-12" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Animated blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", top: "-8%", left: "-6%" }}
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 350, height: 350, background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", bottom: "-5%", right: "-4%" }}
        animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)", top: "40%", right: "12%" }}
        animate={{ x: [0, 18, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/50"
          style={{
            width: 2,
            height: 2,
            left: `${(i * 17 + 13) % 100}%`,
            top: `${(i * 29 + 7) % 100}%`,
            opacity: 0.15 + (i % 6) * 0.08,
          }}
        />
      ))}

      {/* Typography background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-6 opacity-[0.06]">
        <p className="text-white font-black text-[120px] leading-none tracking-tighter">TITLE PILL</p>
        <p className="text-white text-sm font-semibold tracking-[0.4em] uppercase">hover · expand · glass material</p>
      </div>

      {/* Floating text elements */}
      <div className="absolute top-16 left-16 text-white/25 text-xs font-mono uppercase tracking-wider">
        shell-kit component
      </div>
      <div className="absolute top-16 right-16 text-white/25 text-xs font-mono uppercase tracking-wider text-right">
        liquid glass surface
      </div>
      <div className="absolute bottom-16 left-16 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
        truncation · auto-scroll
      </div>
      <div className="absolute bottom-16 right-16 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] text-right">
        backdrop-filter blur
      </div>

      {/* Center stage — the pill */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/35 text-xs tracking-[0.25em] uppercase font-bold"
        >
          hover to expand
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          style={{ width: args.width }}
        >
          {args.compact ? (
            <CompactTitlePill
              label={args.label}
              expandedMaxWidth={args.expandedMaxWidth}
            />
          ) : (
            <TitlePill
              eyebrow={args.eyebrow}
              title={args.title}
              subtitle={args.subtitle}
              expandedMaxWidth={args.expandedMaxWidth}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-6 text-white/25 text-[10px] uppercase tracking-widest"
        >
          <span>width: {args.width}px</span>
          <span>·</span>
          <span>max: {args.expandedMaxWidth}px</span>
        </motion.div>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  name: "Interactive Playground",
  args: {
    eyebrow: "Analytics",
    title: "Very Long Widget Title That Should Truncate",
    subtitle: "With an equally verbose subtitle text",
    label: "Infrastructure Monitoring Dashboard Overview",
    width: 200,
    expandedMaxWidth: 480,
    compact: false,
  },
  argTypes: {
    eyebrow: {
      control: "text",
      description: "Eyebrow text (only for non-compact mode)",
    },
    title: {
      control: "text",
      description: "Main title text (only for non-compact mode)",
    },
    subtitle: {
      control: "text",
      description: "Subtitle text (only for non-compact mode)",
    },
    label: {
      control: "text",
      description: "Label text (only for compact mode)",
    },
    width: {
      control: { type: "range", min: 80, max: 420, step: 4 },
      description: "Collapsed width before hover expansion",
    },
    expandedMaxWidth: {
      control: { type: "range", min: 240, max: 720, step: 10 },
      description: "Maximum width on hover",
    },
    compact: {
      control: "boolean",
      description: "Use compact pill (single label) or full pill (eyebrow/title/subtitle)",
    },
  },
  render: (args) => <InteractiveDemo {...(args as PlaygroundArgs)} />,
};
