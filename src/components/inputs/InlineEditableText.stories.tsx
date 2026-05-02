"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { InlineEditableText } from "@/components/inputs/InlineEditableText";

type InlineEditableTextStoryArgs = {
  initialValue: string;
  placeholder?: string;
  emptyFallback?: string;
  editable?: boolean;
  disabled?: boolean;
};

function InlineEditableTextEditor({
  value,
  placeholder,
  emptyFallback,
  editable = true,
  disabled = false,
  onChange,
}: {
  value: string;
  placeholder?: string;
  emptyFallback?: string;
  editable?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <InlineEditableText
      value={value}
      placeholder={placeholder}
      emptyFallback={emptyFallback}
      editable={editable}
      disabled={disabled}
      className="mt-3 w-full bg-transparent text-[36px] font-black tracking-[-0.04em] text-neutral-950 outline-none placeholder:text-neutral-300"
      readOnlyClassName="mt-3 text-[36px] font-black tracking-[-0.04em] text-neutral-950"
      onChange={onChange}
      onCommit={() => Promise.resolve()}
    />
  );
}

function InlineEditableTextStory({
  initialValue,
  placeholder,
  emptyFallback,
  editable = true,
  disabled = false,
}: InlineEditableTextStoryArgs): ReactElement {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-[420px] rounded-[28px] border border-black/10 bg-white/80 p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Inline Title</p>
      <InlineEditableTextEditor
        value={value}
        placeholder={placeholder}
        emptyFallback={emptyFallback}
        editable={editable}
        disabled={disabled}
        onChange={setValue}
      />
      <p className="mt-4 text-sm text-neutral-500">
        Current value: <span className="font-semibold text-neutral-900">{value || "(empty)"}</span>
      </p>
    </div>
  );
}

const meta = {
  title: "Inputs/InlineEditableText",
  component: InlineEditableTextStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Reusable inline text editor for shell headers, widgets, and form-like surfaces. The component owns only editing UX; persistence stays outside via `onCommit`.",
      },
    },
  },
  argTypes: {
    editable: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    emptyFallback: { control: "text" },
    initialValue: { control: "text" },
  },
  args: {
    initialValue: "Untitled Marker",
    placeholder: "Enter a title",
    emptyFallback: "Untitled Marker",
    editable: true,
    disabled: false,
  },
  render: (args) => <InlineEditableTextStory {...args} />,
} satisfies Meta<typeof InlineEditableTextStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyDraft: Story = {
  args: {
    initialValue: "",
  },
};

export const ReadOnly: Story = {
  args: {
    editable: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const HeroScale: Story = {
  args: {
    initialValue: "Cascais Coastal Walk",
  },
  render: (args) => {
    const [value, setValue] = useState(args.initialValue);

    return (
      <div className="w-[520px] rounded-[32px] border border-black/10 bg-white/80 px-8 py-6 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#ff2d14] text-white">
            <span className="text-xl font-black">P</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Location</p>
            <InlineEditableTextEditor
              value={value}
              placeholder={args.placeholder}
              emptyFallback={args.emptyFallback}
              editable={args.editable}
              disabled={args.disabled}
              onChange={setValue}
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          Hero preview value: <span className="font-semibold text-neutral-900">{value || "(empty)"}</span>
        </p>
      </div>
    );
  },
};
