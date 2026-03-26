"use client";

import { useCallback, useState, type DragEvent } from "react";

import {
  moveShellWidget,
  type ShellDropEdge,
  type ShellWidgetLike,
} from "@/lib/shell-widget-order";

interface ShellWidgetDropTarget {
  widgetId: string;
  edge: ShellDropEdge;
}

interface UseShellWidgetReorderParams<T extends ShellWidgetLike> {
  widgets: T[];
  onReorder?: (nextWidgets: T[]) => void;
}

export const useShellWidgetReorder = <T extends ShellWidgetLike>({
  widgets,
  onReorder,
}: UseShellWidgetReorderParams<T>) => {
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ShellWidgetDropTarget | null>(null);

  const commitWidgetReorder = useCallback(
    (targetWidgetId: string, edge: ShellDropEdge) => {
      if (!draggedWidgetId || !onReorder) {
        return;
      }

      const nextWidgets = moveShellWidget(widgets, draggedWidgetId, targetWidgetId, edge);

      if (nextWidgets === widgets) {
        return;
      }

      onReorder(nextWidgets);
    },
    [draggedWidgetId, onReorder, widgets]
  );

  const handleDragStart = useCallback((event: DragEvent<HTMLDivElement>, widgetId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", widgetId);
    setDraggedWidgetId(widgetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedWidgetId(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, widgetId: string) => {
      if (!draggedWidgetId || draggedWidgetId === widgetId) {
        return;
      }

      event.preventDefault();

      const targetRect = event.currentTarget.getBoundingClientRect();
      const edge: ShellDropEdge =
        event.clientY < targetRect.top + targetRect.height / 2 ? "before" : "after";

      if (dropTarget?.widgetId !== widgetId || dropTarget.edge !== edge) {
        setDropTarget({ widgetId, edge });
      }
    },
    [draggedWidgetId, dropTarget]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, widgetId: string) => {
      event.preventDefault();

      const edge = dropTarget?.widgetId === widgetId ? dropTarget.edge : "after";
      commitWidgetReorder(widgetId, edge);
      setDraggedWidgetId(null);
      setDropTarget(null);
    },
    [commitWidgetReorder, dropTarget]
  );

  return {
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
};
