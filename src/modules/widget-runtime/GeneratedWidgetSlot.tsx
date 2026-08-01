"use client";

import { ShellSlot, WidgetProvider } from "@synarava/shell-kit";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { ExecutedWidget } from "@synarava/widget-generator/executor";
import { WIDGET_SANDBOX_MODULES } from "@/modules/widget-runtime/sandbox-modules";
import { GeneratedWidgetRuntimeProvider } from "@/modules/widget-runtime/GeneratedWidgetRuntimeContext";
import { archiveGeneratedWidget, placeGeneratedWidget } from "@/app/actions";
import type { GeneratedWidgetRecord } from "@/app/actions";
import type { WidgetHost } from "@/modules/shell/widget-hosts";

interface GeneratedWidgetSlotProps {
  widget: GeneratedWidgetRecord;
  /**
   * The shell host this slot is rendered in.
   * Used to determine remove behavior:
   * - widget_center → archive the widget entirely
   * - any other host → remove just this host from targetHosts
   */
  host: WidgetHost;
  isDragging?: boolean;
  onHandlePointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  /** Called after a successful remove/archive so the parent can refresh. */
  onRemoved?: () => void;
}

export function GeneratedWidgetSlot({
  widget,
  host,
  isDragging = false,
  onHandlePointerDown,
  onRemoved,
}: GeneratedWidgetSlotProps) {
  const handleRemove = async () => {
    if (host === "widget_center") {
      await archiveGeneratedWidget(widget.id);
    } else {
      const nextHosts = widget.targetHosts.filter((h) => h !== host);
      await placeGeneratedWidget(widget.id, nextHosts);
    }
    onRemoved?.();
  };

  return (
    <ShellSlot
      widgetId={widget.id}
      isDragging={isDragging}
      onHandlePointerDown={onHandlePointerDown ?? (() => undefined)}
    >
      <WidgetErrorBoundary>
        <GeneratedWidgetRuntimeProvider
          widget={widget}
          onArchive={() => void handleRemove()}
        >
          <ExecutedWidget
            code={widget.componentCode}
            modules={WIDGET_SANDBOX_MODULES}
            onError={(err) => console.error("[GeneratedWidgetSlot]", widget.widgetKey, err)}
          />
        </GeneratedWidgetRuntimeProvider>
      </WidgetErrorBoundary>
    </ShellSlot>
  );
}
