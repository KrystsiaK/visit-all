"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StarRatingInput } from "@/components/inputs/StarRatingInput";

type StarRatingInputStoryArgs = {
  initialValue: number | null;
  disabled?: boolean;
  readOnly?: boolean;
};

function StarRatingInputStory({
  initialValue,
  disabled = false,
  readOnly = false,
}: StarRatingInputStoryArgs): ReactElement {
  const [value, setValue] = useState<number | null>(initialValue);

  return (
    <div className="w-[420px] rounded-[28px] border border-black/10 bg-white/80 p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Rating</p>
      <StarRatingInput
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        className="mt-4"
        onChange={setValue}
      />
      <p className="mt-4 text-sm text-neutral-500">
        Current value: <span className="font-semibold text-neutral-900">{value ?? "Unrated"}</span>
      </p>
    </div>
  );
}

const meta = {
  title: "Inputs/StarRatingInput",
  component: StarRatingInputStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Reusable star-rating primitive for enrichment widgets and lightweight rating flows. The component owns only the input UX; persistence stays outside via `onChange`.",
      },
    },
  },
  argTypes: {
    initialValue: { control: "number" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    initialValue: null,
    disabled: false,
    readOnly: false,
  },
} satisfies Meta<typeof StarRatingInputStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Rated: Story = {
  args: {
    initialValue: 4,
  },
};

export const Disabled: Story = {
  args: {
    initialValue: 4,
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    initialValue: 3,
    readOnly: true,
  },
};
