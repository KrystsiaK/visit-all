"use client";

import { useState, useCallback, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  BaseShell,
  BaseWidget,
  ShellRuntimeProvider,
  ShellSlot,
  WidgetProvider,
  useShellWidgetReorder,
  shellEntrancePresets,
  type ShellWidgetLike,
  type ShellEntranceName,
} from "../src";

/* ── Data ───────────────────────────────────────── */

interface DemoWidget extends ShellWidgetLike {
  title: string;
  body: string;
}

const INITIAL_WIDGETS: DemoWidget[] = [
  { id: "w1", position: 0, title: "Weather", body: "Sunny, 24 °C — perfect day for exploring." },
  { id: "w2", position: 1, title: "Tasks", body: "3 items remaining for today." },
  { id: "w3", position: 2, title: "Notes", body: "Remember to check the viewpoint at sunset." },
];

/* ── Shell with reorderable widgets ─────────────── */

function DemoShellContent({
  widgets,
  onReorder,
}: {
  widgets: DemoWidget[];
  onReorder: (next: DemoWidget[]) => void;
}) {
  const {
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useShellWidgetReorder({ shellId: "demo", widgets, onReorder });

  return (
    <>
      {widgets.map((widget) => (
        <ShellSlot
          key={widget.id}
          isDragging={draggedWidgetId === widget.id}
          isDropTarget={dropTarget?.widgetId === widget.id}
          dropEdge={dropTarget?.widgetId === widget.id ? dropTarget.edge : null}
          onDragStart={(e) => handleDragStart(e, widget.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, widget.id)}
          onDrop={(e) => handleDrop(e, widget.id)}
        >
          <BaseWidget eyebrow="Widget" title={widget.title}>
            <p className="text-sm text-neutral-600">{widget.body}</p>
          </BaseWidget>
        </ShellSlot>
      ))}
    </>
  );
}

function ShellWithWidgetsStory(): ReactElement {
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS);
  const [isOpen, setIsOpen] = useState(true);
  const handleReopen = useCallback(() => setIsOpen(true), []);

  return (
    <div className="relative h-[600px] w-[440px]">
      {!isOpen ? (
        <button
          onClick={handleReopen}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow"
        >
          Reopen shell
        </button>
      ) : null}

      <ShellRuntimeProvider shellId="demo">
        <WidgetProvider currentHost="demo-shell">
          <BaseShell
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Demo Shell"
            subtitle="Drag widgets to reorder"
            closeLabel="Close shell"
            shellClassName="absolute inset-0 flex flex-col pointer-events-auto"
            surfaceClassName="h-full pointer-events-auto"
            showBackdrop={false}
            mobileHandle={false}
          >
            <DemoShellContent widgets={widgets} onReorder={setWidgets} />
          </BaseShell>
        </WidgetProvider>
      </ShellRuntimeProvider>
    </div>
  );
}

/* ── Minimal shell (no widgets) ────────────────── */

function MinimalShellStory(): ReactElement {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative h-[400px] w-[400px]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow"
        >
          Reopen
        </button>
      ) : null}

      <BaseShell
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Settings"
        subtitle="Minimal shell with static content"
        closeLabel="Close"
        shellClassName="absolute inset-0 flex flex-col pointer-events-auto"
        surfaceClassName="h-full pointer-events-auto"
        showBackdrop={false}
        mobileHandle={false}
      >
        <div className="rounded-2xl border border-black/8 bg-white/55 p-6 text-sm text-neutral-600">
          This is a plain BaseShell with no widgets — just static content inside.
        </div>
      </BaseShell>
    </div>
  );
}

/* ── Meta ───────────────────────────────────────── */

const meta = {
  title: "Shell Kit/BaseShell",
  component: ShellWithWidgetsStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "BaseShell is the panel container. Combined with ShellSlot and useShellWidgetReorder, it supports draggable widget layouts with auto-scroll.",
      },
    },
  },
} satisfies Meta<typeof ShellWithWidgetsStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithWidgets: Story = {
  name: "Shell + Widgets + Drag Reorder",
};

export const Minimal: Story = {
  name: "Minimal Shell",
  render: () => <MinimalShellStory />,
};

/* ── Entrance Presets Gallery ──────────────────── */

function PresetCard({ entrance }: { entrance: ShellEntranceName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider shadow transition-colors hover:bg-neutral-50"
      >
        {entrance}
      </button>

      <div className="relative h-[320px] w-[280px] overflow-hidden rounded-2xl border border-black/6 bg-neutral-50">
        <BaseShell
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={entrance}
          subtitle="Click button above to replay"
          closeLabel="Close"
          entrance={entrance}
          shellClassName="absolute inset-2 flex flex-col pointer-events-auto"
          surfaceClassName="h-full pointer-events-auto"
          showBackdrop={false}
          mobileHandle={false}
        >
          <BaseWidget eyebrow="Demo" title="Content">
            <p className="text-xs text-neutral-500">Shell entrance: <strong>{entrance}</strong></p>
          </BaseWidget>
        </BaseShell>
      </div>
    </div>
  );
}

function EntrancePresetsGallery(): ReactElement {
  const presetNames = Object.keys(shellEntrancePresets) as ShellEntranceName[];

  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {presetNames.map((name) => (
        <PresetCard key={name} entrance={name} />
      ))}
    </div>
  );
}

export const EntrancePresets: Story = {
  name: "Entrance Presets Gallery",
  render: () => <EntrancePresetsGallery />,
};

