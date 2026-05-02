"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

import { useOptionalShellRuntimeActions } from "./ShellRuntime";
import {
  moveShellWidget,
  type ShellDropEdge,
  type ShellWidgetLike,
} from "./shell-widget-order";

interface ShellWidgetDropTarget {
  widgetId: string;
  edge: ShellDropEdge;
}

interface UseShellWidgetReorderParams<T extends ShellWidgetLike> {
  shellId?: string;
  widgets: T[];
  onReorder?: (nextWidgets: T[]) => void;
}

const AUTO_SCROLL_THRESHOLD_PX = 88;
const AUTO_SCROLL_MAX_SPEED = 22;
const WIDGET_REVEAL_MARGIN_PX = 72;
const WIDGET_REVEAL_STEP_PX = 18;

export function getAutoScrollVelocity({
  pointerY,
  containerTop,
  containerBottom,
}: {
  pointerY: number;
  containerTop: number;
  containerBottom: number;
}) {
  const distanceToTop = pointerY - containerTop;
  if (distanceToTop < AUTO_SCROLL_THRESHOLD_PX) {
    const intensity = 1 - Math.max(0, distanceToTop) / AUTO_SCROLL_THRESHOLD_PX;
    return -Math.ceil(AUTO_SCROLL_MAX_SPEED * intensity);
  }

  const distanceToBottom = containerBottom - pointerY;
  if (distanceToBottom < AUTO_SCROLL_THRESHOLD_PX) {
    const intensity = 1 - Math.max(0, distanceToBottom) / AUTO_SCROLL_THRESHOLD_PX;
    return Math.ceil(AUTO_SCROLL_MAX_SPEED * intensity);
  }

  return 0;
}

export function getWidgetHoverScrollVelocity({
  targetTop,
  targetBottom,
  containerTop,
  containerBottom,
  edge,
}: {
  targetTop: number;
  targetBottom: number;
  containerTop: number;
  containerBottom: number;
  edge: ShellDropEdge;
}) {
  if (edge === "after") {
    const overlapWithBottomZone = targetBottom - (containerBottom - WIDGET_REVEAL_MARGIN_PX);
    if (overlapWithBottomZone > 0) {
      return Math.min(
        AUTO_SCROLL_MAX_SPEED,
        WIDGET_REVEAL_STEP_PX + Math.ceil(overlapWithBottomZone / 6)
      );
    }
  }

  if (edge === "before") {
    const overlapWithTopZone = containerTop + WIDGET_REVEAL_MARGIN_PX - targetTop;
    if (overlapWithTopZone > 0) {
      return -Math.min(
        AUTO_SCROLL_MAX_SPEED,
        WIDGET_REVEAL_STEP_PX + Math.ceil(overlapWithTopZone / 6)
      );
    }
  }

  return 0;
}

export const useShellWidgetReorder = <T extends ShellWidgetLike>({
  shellId,
  widgets,
  onReorder,
}: UseShellWidgetReorderParams<T>) => {
  const runtimeActions = useOptionalShellRuntimeActions();
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ShellWidgetDropTarget | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const autoScrollVelocityRef = useRef(0);

  const stopAutoScroll = useCallback(() => {
    autoScrollVelocityRef.current = 0;

    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }, []);

  const getScrollContainer = useCallback(() => {
    const runtimeContainer = runtimeActions?.getScrollContainer() ?? null;
    if (runtimeContainer) {
      return runtimeContainer;
    }

    if (typeof document === "undefined" || !shellId) {
      return null;
    }

    return document.querySelector<HTMLElement>(`[data-shell-scroll-container="${shellId}"]`);
  }, [runtimeActions, shellId]);

  const ensureAutoScroll = useCallback(() => {
    if (autoScrollFrameRef.current !== null) {
      return;
    }

      const tick = () => {
      const scrollContainer = getScrollContainer();
      const velocity = autoScrollVelocityRef.current;

      if (!scrollContainer || velocity === 0) {
        autoScrollFrameRef.current = null;
        return;
      }

      const maxTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const nextTop = Math.max(0, Math.min(maxTop, scrollContainer.scrollTop + velocity));
      scrollContainer.scrollTop = nextTop;
      autoScrollFrameRef.current = requestAnimationFrame(tick);
    };

    autoScrollFrameRef.current = requestAnimationFrame(tick);
    }, [getScrollContainer]);

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
    stopAutoScroll();
    setDraggedWidgetId(null);
    setDropTarget(null);
  }, [stopAutoScroll]);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, widgetId: string) => {
      if (!draggedWidgetId || draggedWidgetId === widgetId) {
        return;
      }

      event.preventDefault();

      const targetRect = event.currentTarget.getBoundingClientRect();
      const edge: ShellDropEdge =
        event.clientY < targetRect.top + targetRect.height / 2 ? "before" : "after";

      const scrollContainer = getScrollContainer();
      if (scrollContainer) {
        const scrollRect = scrollContainer.getBoundingClientRect();
        const edgeVelocity = getAutoScrollVelocity({
          pointerY: event.clientY,
          containerTop: scrollRect.top,
          containerBottom: scrollRect.bottom,
        });
        const hoverVelocity = getWidgetHoverScrollVelocity({
          targetTop: targetRect.top,
          targetBottom: targetRect.bottom,
          containerTop: scrollRect.top,
          containerBottom: scrollRect.bottom,
          edge,
        });
        autoScrollVelocityRef.current =
          Math.abs(hoverVelocity) > Math.abs(edgeVelocity) ? hoverVelocity : edgeVelocity;

        if (autoScrollVelocityRef.current !== 0) {
          ensureAutoScroll();
        } else {
          stopAutoScroll();
        }
      }

      if (dropTarget?.widgetId !== widgetId || dropTarget.edge !== edge) {
        setDropTarget({ widgetId, edge });
      }
    },
    [draggedWidgetId, dropTarget, ensureAutoScroll, getScrollContainer, stopAutoScroll]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, widgetId: string) => {
      event.preventDefault();

      stopAutoScroll();
      const edge = dropTarget?.widgetId === widgetId ? dropTarget.edge : "after";
      commitWidgetReorder(widgetId, edge);
      setDraggedWidgetId(null);
      setDropTarget(null);
    },
    [commitWidgetReorder, dropTarget, stopAutoScroll]
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
