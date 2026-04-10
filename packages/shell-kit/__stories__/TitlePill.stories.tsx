"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TitlePill, CompactTitlePill } from "../src";

const meta = {
  title: "Shell Kit/TitlePill",
  component: TitlePill,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A floating glass pill that shows eyebrow, title, and subtitle. Used by BaseWidget but can be used standalone.",
      },
    },
  },
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
} satisfies Meta<typeof TitlePill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "Widget",
    title: "Weather",
    subtitle: "Current conditions",
  },
};

export const TitleOnly: Story = {
  name: "Title Only",
  args: {
    title: "My Dashboard",
  },
};

export const EyebrowOnly: Story = {
  name: "Eyebrow Only",
  args: {
    eyebrow: "Section",
  },
};

export const LongText: Story = {
  name: "Long Text (truncation)",
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
  args: {
    eyebrow: "Analytics",
    title: "Very Long Widget Title That Should Truncate",
    subtitle: "With an equally verbose subtitle text",
  },
};

export const EllipsisTitleOnly: Story = {
  name: "Ellipsis · title overflow",
  decorators: [
    (Story) => (
      <div className="w-[120px]">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Extremely Long Dashboard Widget Title",
  },
};

export const EllipsisAllFields: Story = {
  name: "Ellipsis · all fields overflow",
  decorators: [
    (Story) => (
      <div className="w-[160px]">
        <Story />
      </div>
    ),
  ],
  args: {
    eyebrow: "Infrastructure Monitoring",
    title: "Server Response Latency Overview",
    subtitle: "99th-percentile breakdown by region",
  },
};

export const EllipsisNarrowPill: Story = {
  name: "Ellipsis · extreme squeeze (80 px)",
  decorators: [
    (Story) => (
      <div className="w-[80px]">
        <Story />
      </div>
    ),
  ],
  args: {
    eyebrow: "Section",
    title: "Weather",
    subtitle: "Current conditions in your area",
  },
};

export const EllipsisWidthRange: Story = {
  name: "Ellipsis · width comparison (hover to expand)",
  render: () => (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-neutral-400">Hover any pill to see it expand. If text still overflows at 480 px, it auto-scrolls.</p>
      {[100, 140, 180, 240, 320].map((w) => (
        <div key={w} className="flex items-center gap-3">
          <span className="w-12 text-right text-[11px] tabular-nums text-neutral-400">
            {w}px
          </span>
          <div style={{ width: w }}>
            <TitlePill
              eyebrow="Analytics"
              title="Very Long Widget Title That Truncates"
              subtitle="With an equally verbose subtitle"
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const HoverExpandDemo: Story = {
  name: "Hover Expand · Liquid Glass",
  render: () => (
    <div className="flex flex-col gap-6">
      <p className="max-w-md text-xs leading-5 text-neutral-400">
        Hover over the pills below. They expand up to 480 px with an enhanced
        glass effect. If content still overflows, gradient masks appear and the
        text auto-scrolls.
      </p>
      <div className="flex flex-col gap-4">
        <div className="w-[140px]">
          <TitlePill
            eyebrow="Analytics"
            title="Very Long Widget Title"
            subtitle="With an equally verbose subtitle text"
          />
        </div>
        <div className="w-[200px]">
          <TitlePill
            eyebrow="Infrastructure Monitoring"
            title="Server Response Latency Overview Dashboard"
            subtitle="99th-percentile breakdown by region and availability zone for all production clusters"
          />
        </div>
        <div className="w-[100px]">
          <CompactTitlePill label="Infrastructure Monitoring Dashboard Overview" />
        </div>
      </div>
    </div>
  ),
};

export const Compact: Story = {
  name: "Compact Variant",
  render: () => <CompactTitlePill label="Weather" />,
};

export const CompactCustomIcon: Story = {
  name: "Compact with Custom Icon",
  render: () => (
    <CompactTitlePill
      label="Favorites"
      icon={<span className="text-xs">⭐</span>}
    />
  ),
};

export const CompactEllipsis: Story = {
  name: "Compact · label overflow",
  render: () => (
    <div className="w-[100px]">
      <CompactTitlePill label="Infrastructure Monitoring Dashboard" />
    </div>
  ),
};

export const CompactEllipsisWidthRange: Story = {
  name: "Compact · width comparison (hover to expand)",
  render: () => (
    <div className="flex flex-col gap-4">
      {[80, 120, 160, 240].map((w) => (
        <div key={w} className="flex items-center gap-3">
          <span className="w-12 text-right text-[11px] tabular-nums text-neutral-400">
            {w}px
          </span>
          <div style={{ width: w }}>
            <CompactTitlePill label="Infrastructure Monitoring Dashboard" />
          </div>
        </div>
      ))}
    </div>
  ),
};

