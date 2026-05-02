"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BaseWidget, DockedShell, ShellRuntimeProvider, WidgetProvider } from "../src";

const meta = {
  title: "Shell Kit/Overview",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "High-level tour of shell-kit. The package should own shell motion, pinned-versus-scroll rhythm, and widget chrome so product shells can stay thin adapters.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Architecture: Story = {
  render: () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_40%),linear-gradient(180deg,#dcecf4_0%,#eef4f8_50%,#f7f7f3_100%)] p-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
            Shell Kit
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Shared shell and widget primitives
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-neutral-600">
            The contract is simple: product code chooses placement and content; shell-kit owns
            entrance motion, scroll containment, pinned hero rhythm, widget slots, and widget
            chrome. This keeps left and right shells visually and behaviorally aligned.
          </p>
        </div>

        <ShellRuntimeProvider shellId="storybook-shell-overview">
          <WidgetProvider currentHost="storybook-shell-overview">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="relative h-[640px] overflow-hidden rounded-[32px] border border-black/8 bg-white/35">
                <DockedShell
                  placement="left"
                  isOpen
                  onClose={() => undefined}
                  title="Layers"
                  subtitle="Navigation and map controls"
                  closeLabel="Close"
                  width={356}
                  showBackdrop={false}
                  pinnedContent={
                    <BaseWidget eyebrow="Shell" title="Pinned Hero" identityVisibility="inline">
                      <p className="text-sm text-neutral-600">Pinned widgets stay above the main stack.</p>
                    </BaseWidget>
                  }
                >
                  <BaseWidget eyebrow="Widget" title="Collections">
                    <p className="text-sm text-neutral-600">Main widgets scroll beneath pinned content.</p>
                  </BaseWidget>
                  <BaseWidget eyebrow="Widget" title="Create">
                    <p className="text-sm text-neutral-600">Product shells should not rebuild this rhythm manually.</p>
                  </BaseWidget>
                </DockedShell>
              </div>

              <div className="grid content-start gap-4">
                <BaseWidget eyebrow="Principle" title="Placement-driven">
                  <p className="text-sm text-neutral-600">
                    Pass placement and width. `DockedShell` derives entrance and layout from shared rules.
                  </p>
                </BaseWidget>
                <BaseWidget eyebrow="Principle" title="Pinned + main">
                  <p className="text-sm text-neutral-600">
                    One shared vertical rhythm for left and right shells prevents manual spacing drift.
                  </p>
                </BaseWidget>
                <BaseWidget eyebrow="Principle" title="Thin adapters">
                  <p className="text-sm text-neutral-600">
                    App wrappers should mainly bind runtime state, widget host, and shell-specific hero content.
                  </p>
                </BaseWidget>
              </div>
            </div>
          </WidgetProvider>
        </ShellRuntimeProvider>
      </div>
    </div>
  ),
};
