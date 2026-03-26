import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";

export interface ShellWidgetLike {
  id: string;
  position: number;
}

export type ShellWidgetRecord = WidgetPlacementRecord & WidgetInstanceRecord;
export type ShellDropEdge = "before" | "after";

const withUpdatedPositions = <T extends ShellWidgetLike>(widgets: T[]) =>
  widgets.map((widget, position) => ({
    ...widget,
  position,
  }));

export const moveShellWidget = <T extends ShellWidgetLike>(
  widgets: T[],
  draggedWidgetId: string,
  targetWidgetId: string,
  edge: ShellDropEdge
) => {
  if (draggedWidgetId === targetWidgetId) {
    return widgets;
  }

  const draggedIndex = widgets.findIndex((widget) => widget.id === draggedWidgetId);
  const targetIndex = widgets.findIndex((widget) => widget.id === targetWidgetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return widgets;
  }

  const nextWidgets = [...widgets];
  const [draggedWidget] = nextWidgets.splice(draggedIndex, 1);

  if (!draggedWidget) {
    return widgets;
  }

  const rawInsertIndex = edge === "before" ? targetIndex : targetIndex + 1;
  const insertIndex = draggedIndex < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;
  nextWidgets.splice(insertIndex, 0, draggedWidget);

  return withUpdatedPositions(nextWidgets);
};
