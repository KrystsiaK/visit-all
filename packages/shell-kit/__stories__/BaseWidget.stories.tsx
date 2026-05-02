"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BaseWidget } from "../src";

function BaseWidgetStory(): ReactElement {
  const [backgroundStyle, setBackgroundStyle] = useState("default");

  return (
    <div className="w-[460px]">
      <BaseWidget
        eyebrow="Resources"
        title="Entity Sources"
        subtitle="External references connected to this pin."
        backgroundStyle={backgroundStyle}
        onBackgroundStyleChange={setBackgroundStyle}
        onDelete={() => alert("Delete widget clicked!")}
      >
        <div className="rounded-xl bg-white/35 px-4 py-4 text-sm leading-6 text-neutral-700">
          Shared widget chrome with a background-style setting. This story exists so we can
          tune the system-level surface treatment once and reuse it everywhere.
          <br /><br />
          Click the settings gear to see background color options and delete button.
        </div>
      </BaseWidget>
    </div>
  );
}

function ExpandedBaseWidgetStory(): ReactElement {
  return (
    <div className="w-[460px]">
      <BaseWidget
        eyebrow="Notes"
        title="Expanded Editor"
        subtitle="Editing surfaces can temporarily grow instead of clipping."
        sizeMode="expanded"
      >
        <div className="space-y-3 rounded-xl bg-white/35 px-4 py-4 text-sm leading-6 text-neutral-700">
          <div className="rounded-xl bg-white/80 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Raw Markdown
            </p>
            <div className="mt-2 min-h-[220px] rounded-2xl border border-black/10 bg-white px-4 py-4">
              # Example
              <br />
              <br />
              Editing mode can expand the widget instead of forcing an internal scroll clamp.
            </div>
          </div>
        </div>
      </BaseWidget>
    </div>
  );
}

const meta = {
  title: "Shell Kit/BaseWidget",
  component: BaseWidgetStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "System-level card chrome used by widgets. Background styling is configured here once and then flows into any widget that uses BaseWidget.",
      },
    },
  },
} satisfies Meta<typeof BaseWidgetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Expanded: Story = {
  render: () => <ExpandedBaseWidgetStory />,
};

