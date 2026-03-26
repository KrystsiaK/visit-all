"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ShellWidgetBoundaryProps {
  widgetId: string;
  layoutReady?: boolean;
  onLayoutReady?: (widgetId: string) => void;
  children: ReactNode;
}

export function ShellWidgetBoundary({
  widgetId,
  layoutReady = true,
  onLayoutReady,
  children,
}: ShellWidgetBoundaryProps) {
  const announcedRef = useRef(false);

  useEffect(() => {
    if (!layoutReady || !onLayoutReady || announcedRef.current) {
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        announcedRef.current = true;
        onLayoutReady(widgetId);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [layoutReady, onLayoutReady, widgetId]);

  return <div data-shell-widget-id={widgetId}>{children}</div>;
}
