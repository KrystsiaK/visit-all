"use client";

import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BaseWidget, DockedShell, ShellRuntimeProvider, WidgetProvider } from "../src";

function DockedShellStory({ placement }: { placement: "left" | "right" }): ReactElement {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative h-[680px] overflow-hidden rounded-[32px] border border-black/8 bg-[linear-gradient(180deg,#dcecf4_0%,#eef4f8_50%,#f7f7f3_100%)]">
      <ShellRuntimeProvider shellId={`storybook-docked-${placement}`}>
        <WidgetProvider currentHost={`storybook-docked-${placement}`}>
          <DockedShell
            placement={placement}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={placement === "left" ? "Layers" : "Entity"}
            subtitle={placement === "left" ? "Shell navigation" : "Entity enrichments"}
            closeLabel="Close shell"
            width={376}
            showBackdrop={false}
            pinnedContent={
              <BaseWidget eyebrow="Pinned" title="Hero" subtitle="Shared shell-owned rhythm">
                <p className="text-sm text-neutral-600">The hero is always rendered in the pinned zone.</p>
              </BaseWidget>
            }
          >
            <BaseWidget eyebrow="Widget" title="One">
              <p className="text-sm text-neutral-600">Shared scroll body, spacing, and internal containment.</p>
            </BaseWidget>
            <BaseWidget eyebrow="Widget" title="Two">
              <p className="text-sm text-neutral-600">This should feel identical on left and right.</p>
            </BaseWidget>
          </DockedShell>
        </WidgetProvider>
      </ShellRuntimeProvider>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow"
        >
          Reopen shell
        </button>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Shell Kit/DockedShell",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Ergonomic shell-kit primitive for left and right docked shells. Product wrappers should prefer this over rebuilding shell layout classes by hand.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Left: Story = {
  render: () => <DockedShellStory placement="left" />,
};

export const Right: Story = {
  render: () => <DockedShellStory placement="right" />,
};
