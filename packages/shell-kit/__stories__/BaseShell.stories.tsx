"use client";

import { useState, useCallback, useEffect, type ReactElement } from "react";
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
  const [replaying, setReplaying] = useState(false);

  // auto-play on mount so the entrance animation is visible immediately
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  const replay = useCallback(() => {
    if (replaying) return;
    setReplaying(true);
    setIsOpen(false);
    setTimeout(() => {
      setIsOpen(true);
      setReplaying(false);
    }, 220);
  }, [replaying]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-neutral-900 px-2.5 py-1 font-mono text-xs text-white">
          {entrance}
        </span>
        <button
          onClick={replay}
          disabled={replaying}
          className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-medium shadow transition-colors hover:bg-neutral-50 disabled:opacity-40"
        >
          ↺ Replay
        </button>
      </div>

      <div className="relative h-[340px] w-[280px] overflow-hidden rounded-2xl border border-black/8 bg-neutral-100/80 shadow-sm">
        <BaseShell
          isOpen={isOpen}
          onClose={replay}
          title={entrance}
          subtitle="Press ↺ Replay to watch again"
          closeLabel="Replay"
          entrance={entrance}
          shellClassName="absolute inset-2 flex flex-col pointer-events-auto"
          surfaceClassName="h-full pointer-events-auto"
          showBackdrop={false}
          mobileHandle={false}
        >
          <BaseWidget eyebrow="entrance preset" title="Shell content">
            <p className="text-xs text-neutral-500">
              Enters from <strong>{entrance}</strong>
            </p>
          </BaseWidget>
        </BaseShell>

        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-neutral-400">closed</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EntrancePresetsGallery(): ReactElement {
  const presetNames = Object.keys(shellEntrancePresets) as ShellEntranceName[];

  return (
    <div className="flex flex-wrap items-start justify-center gap-8 p-8">
      {presetNames.map((name) => (
        <PresetCard key={name} entrance={name} />
      ))}
    </div>
  );
}

export const EntrancePresets: Story = {
  name: "Entrance Presets Gallery",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "All 5 `ShellEntranceName` presets side-by-side. Shells open immediately on load. Hit **↺ Replay** on any card to replay its entrance animation.",
      },
    },
  },
  render: () => <EntrancePresetsGallery />,
};

