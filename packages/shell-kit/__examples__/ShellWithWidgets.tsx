/**
 * @synarava/shell-kit — living example
 *
 * This file shows how to compose shell-kit atoms into a working
 * shell with draggable widgets. It's not meant to be imported by
 * the host app — it serves as documentation and a Storybook source.
 */
import { useState, type ReactNode } from "react";

import {
  BaseShell,
  BaseWidget,
  ShellRuntimeProvider,
  ShellSlot,
  WidgetProvider,
  useShellWidgetReorder,
  type ShellWidgetLike,
} from "../src";

interface DemoWidget extends ShellWidgetLike {
  title: string;
  body: string;
}

const INITIAL_WIDGETS: DemoWidget[] = [
  { id: "w1", position: 0, title: "Weather", body: "Sunny, 24°C" },
  { id: "w2", position: 1, title: "Tasks", body: "3 items remaining" },
  { id: "w3", position: 2, title: "Notes", body: "Remember to buy milk" },
];

function WidgetCard({ widget }: { widget: DemoWidget }) {
  return (
    <BaseWidget title={widget.title}>
      <p className="text-sm text-neutral-600">{widget.body}</p>
    </BaseWidget>
  );
}

function DemoShellContent({ widgets, onReorder }: { widgets: DemoWidget[]; onReorder: (next: DemoWidget[]) => void }) {
  const { draggedWidgetId, dropTarget, handleDragStart, handleDragEnd, handleDragOver, handleDrop } =
    useShellWidgetReorder({ shellId: "demo", widgets, onReorder });

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
          <WidgetCard widget={widget} />
        </ShellSlot>
      ))}
    </>
  );
}

export function ShellWithWidgets(): ReactNode {
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS);

  return (
    <ShellRuntimeProvider shellId="demo">
      <WidgetProvider currentHost="demo-shell">
        <BaseShell
          isOpen
          onClose={() => {}}
          title="Demo Shell"
          subtitle="Drag widgets to reorder"
          closeLabel="Close"
          shellClassName="relative w-[420px]"
          showBackdrop={false}
          mobileHandle={false}
        >
          <DemoShellContent widgets={widgets} onReorder={setWidgets} />
        </BaseShell>
      </WidgetProvider>
    </ShellRuntimeProvider>
  );
}

