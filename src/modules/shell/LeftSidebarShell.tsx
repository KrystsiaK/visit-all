"use client";

import { useEffect, useMemo } from "react";
import {
  BaseShell,
  ShellRuntimeProvider,
  ShellSlot,
  WidgetProvider,
  useShellRuntimeActions,
  useShellWidgetReorder,
  type ShellRuntimeState,
} from "@synarava/shell-kit";
import {
  WiringConfigProvider,
  useSignalActions,
  useSignalValue,
} from "@synarava/wiring-engine";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { DestructiveActionDialog } from "@synarava/ui-kit";
import { WIDGET_MANIFEST, WIDGET_REGISTRY } from "@/modules/shell/widget-manifest";
import { useMapMode } from "@/modules/map/MapModeContext";
import { SHELL_GLASS } from "@/modules/shell/constants";
import { SHELL_PANEL_CONTENT_LAYOUT, SHELL_PANEL_STYLE } from "@/modules/shell/constants";
import { useCollections } from "@/modules/collections/CollectionsContext";
import { useGeneratedWidgetsForHost } from "@/modules/widget-runtime/useGeneratedWidgetsForHost";
import { GeneratedWidgetSlot } from "@/modules/widget-runtime/GeneratedWidgetSlot";
import { notifyWidgetLibraryChanged } from "@/modules/widget-runtime/notifyWidgetLibraryChanged";
import type { WidgetPlacementRecord, WidgetInstanceRecord } from "@/lib/widgets";
import { makeLeftShellWiringConfig } from "@/modules/shell/wiring/left-shell-wiring";

type ShellWidget = WidgetPlacementRecord & WidgetInstanceRecord;

interface LeftSidebarShellProps {
  shellId?: string;
  isOpen: boolean;
  onClose: () => void;
  widgets: ShellWidget[];
  onWidgetsReorder?: (next: ShellWidget[]) => void;
}

/**
 * App adapter between the map domain and the generic wiring bus.
 * Widgets never import MapModeContext directly.
 */
function MapModeWiringAdapter() {
  const {
    mode,
    setMode,
    interactionLocked,
    onClearSelection,
    traceRoutingMode,
    setTraceRoutingMode,
    traceRoutingPending,
    traceRoutingError,
  } = useMapMode();
  const { setSignal } = useSignalActions();
  const requestedMode = useSignalValue<string | null>("interactionModeRequest", null);
  const requestedTraceRoutingMode = useSignalValue<string | null>("traceRoutingModeRequest", null);

  useEffect(() => { setSignal("interactionMode", mode); }, [mode, setSignal]);
  useEffect(() => { setSignal("interactionLocked", interactionLocked); }, [interactionLocked, setSignal]);
  useEffect(() => { setSignal("traceRoutingMode", traceRoutingMode); }, [setSignal, traceRoutingMode]);
  useEffect(() => { setSignal("traceRoutingPending", traceRoutingPending); }, [setSignal, traceRoutingPending]);
  useEffect(() => { setSignal("traceRoutingError", traceRoutingError); }, [setSignal, traceRoutingError]);
  useEffect(() => {
    if (
      requestedMode !== "pin" &&
      requestedMode !== "trace" &&
      requestedMode !== "area"
    ) {
      return;
    }

    if (requestedMode !== mode) {
      setMode(requestedMode);
      onClearSelection();
    }

    // A mode request is a command, not durable state. Acknowledge it so
    // later domain transitions such as editPin are not overwritten.
    setSignal("interactionModeRequest", null);
  }, [mode, onClearSelection, requestedMode, setMode, setSignal]);

  useEffect(() => {
    if (
      interactionLocked ||
      (requestedTraceRoutingMode !== "direct" && requestedTraceRoutingMode !== "pedestrian")
    ) {
      return;
    }

    setTraceRoutingMode(requestedTraceRoutingMode);
    setSignal("traceRoutingModeRequest", null);
  }, [interactionLocked, requestedTraceRoutingMode, setSignal, setTraceRoutingMode]);

  return null;
}

function CollectionDeleteDialog() {
  const { collectionPendingDelete, onRequestDelete, onConfirmDelete } = useCollections();

  return (
    <DestructiveActionDialog
      open={!!collectionPendingDelete}
      saving={false}
      eyebrow="Delete Layer"
      title={collectionPendingDelete?.name ?? ""}
      description="This layer and all of its pins, paths, and zones will be permanently deleted."
      confirmLabel="Delete Layer"
      onCancel={() => onRequestDelete(null)}
      onConfirm={() => collectionPendingDelete && onConfirmDelete(collectionPendingDelete.id)}
    />
  );
}

function LeftSidebarShellContent({
  shellId,
  isOpen,
  onClose,
  widgets,
  onWidgetsReorder,
}: Required<LeftSidebarShellProps>) {
  const { registerScrollContainer } = useShellRuntimeActions();
  const {
    mode,
    drawingPath,
    traceDraftFinalized,
    areaDraftFinalized,
  } = useMapMode();

  const finishActionVisible =
    (mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized) ||
    (mode === "area" && drawingPath.length >= 3 && !areaDraftFinalized);
  const draftControlsVisible =
    (mode === "trace" && drawingPath.length > 0 && !traceDraftFinalized) ||
    (mode === "area" && drawingPath.length > 0 && !areaDraftFinalized);

  const sorted = useMemo(
    () => [...widgets].sort((a, b) => a.position - b.position),
    [widgets]
  );

  const { draggedWidgetId, previewWidgets, handleSlotPointerDown } = useShellWidgetReorder({
    shellId,
    widgets: sorted,
    onReorder: onWidgetsReorder,
  });
  const generatedWidgets = useGeneratedWidgetsForHost("left_sidebar", isOpen);

  return (
    <>
      <BaseShell
        isOpen={isOpen}
        onClose={onClose}
        title="Visit All"
        closeLabel="Close"
        placement="left"
        showBackdrop={false}
        showHeader={false}
        mobileHandle={false}
        {...SHELL_GLASS}
        shellClassName="fixed bottom-3 left-3 top-[5.25rem] z-40 flex w-[calc(100vw-1.5rem)] md:w-[var(--shell-panel-width)] flex-col pointer-events-none"
        shellStyle={SHELL_PANEL_STYLE}
        surfaceClassName="relative isolate h-full pointer-events-auto overflow-visible rounded-[32px] [contain:paint] [backface-visibility:hidden] [transform:translateZ(0)]"
        {...SHELL_PANEL_CONTENT_LAYOUT}
        scrollContainerRef={registerScrollContainer}
        scrollContainerDataId={shellId}
      >
        <MapModeWiringAdapter />

        {previewWidgets.map((widget) => {
          const entry = WIDGET_MANIFEST[widget.componentKey];
          const Component = WIDGET_REGISTRY[widget.componentKey];
          if (!Component) return null;

          if (widget.componentKey === "shell_finish_trace" && !finishActionVisible) {
            return null;
          }

          if (widget.componentKey === "shell_remove_trace_point" && !draftControlsVisible) {
            return null;
          }

          return (
            <ShellSlot
              key={widget.id}
              widgetId={widget.id}
              isDragging={draggedWidgetId === widget.id}
              hideHandle={entry?.hideHandle}
              onHandlePointerDown={(e) => handleSlotPointerDown(e, widget.id)}
            >
              <WidgetErrorBoundary>
                <Component />
              </WidgetErrorBoundary>
            </ShellSlot>
          );
        })}
        {generatedWidgets.map((widget) => (
          <GeneratedWidgetSlot
            key={widget.id}
            widget={widget}
            host="left_sidebar"
            onRemoved={notifyWidgetLibraryChanged}
          />
        ))}
      </BaseShell>

      <CollectionDeleteDialog />
    </>
  );
}

export function LeftSidebarShell({
  shellId = "left_sidebar",
  isOpen,
  onClose,
  widgets,
  onWidgetsReorder,
}: LeftSidebarShellProps) {
  const wiringConfig = useMemo(() => makeLeftShellWiringConfig(shellId), [shellId]);

  // Temporary until shell-kit delegates its scroll registry to wiring-engine.
  const shellRuntimeState: ShellRuntimeState = useMemo(() => ({}), []);

  return (
    <WiringConfigProvider config={wiringConfig}>
      <ShellRuntimeProvider shellId={shellId} initialState={shellRuntimeState}>
        <WidgetProvider currentHost={shellId}>
          <LeftSidebarShellContent
            shellId={shellId}
            isOpen={isOpen}
            onClose={onClose}
            widgets={widgets}
            onWidgetsReorder={onWidgetsReorder ?? (() => {})}
          />
        </WidgetProvider>
      </ShellRuntimeProvider>
    </WiringConfigProvider>
  );
}
