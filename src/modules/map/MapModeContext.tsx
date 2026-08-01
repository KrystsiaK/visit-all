"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { InteractionMode } from "@/modules/collections/types";
import type { TraceRoutingMode } from "@/modules/map/types";

export interface MapModeContextValue {
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
  drawingPath: { lng: number; lat: number }[];
  traceRoutingMode: TraceRoutingMode;
  setTraceRoutingMode: (mode: TraceRoutingMode) => void;
  traceRoutingPending: boolean;
  traceRoutingError: string | null;
  traceDraftFinalized: boolean;
  areaDraftFinalized: boolean;
  selectedTraceNodeIndex: number | null;
  pendingPin: { lng: number; lat: number } | null;
  editingTraceId: string | null;
  editingAreaId: string | null;
  interactionLocked: boolean;
  awaitingCollectionSelection: boolean;
  itemLabel: string;
  onFinishTraceDraft: () => void;
  onFinishAreaDraft: () => void;
  onRemoveSelectedTraceNode: () => void;
  onUndoDraft: () => void;
  onCancelDraft: () => void;
  onClearSelection: () => void;
}

const MapModeContext = createContext<MapModeContextValue | null>(null);

export function useMapMode(): MapModeContextValue {
  const ctx = useContext(MapModeContext);
  if (!ctx) throw new Error("useMapMode must be used within MapModeProvider");
  return ctx;
}

interface MapModeProviderProps {
  children: ReactNode;
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
  drawingPath: { lng: number; lat: number }[];
  traceRoutingMode: TraceRoutingMode;
  setTraceRoutingMode: (mode: TraceRoutingMode) => void;
  traceRoutingPending: boolean;
  traceRoutingError: string | null;
  traceDraftFinalized: boolean;
  areaDraftFinalized: boolean;
  selectedTraceNodeIndex: number | null;
  pendingPin: { lng: number; lat: number } | null;
  editingTraceId: string | null;
  editingAreaId: string | null;
  onFinishTraceDraft: () => void;
  onFinishAreaDraft: () => void;
  onRemoveSelectedTraceNode: () => void;
  onUndoDraft: () => void;
  onCancelDraft: () => void;
  onClearSelection: () => void;
}

export function MapModeProvider({
  children,
  mode,
  setMode,
  drawingPath,
  traceRoutingMode,
  setTraceRoutingMode,
  traceRoutingPending,
  traceRoutingError,
  traceDraftFinalized,
  areaDraftFinalized,
  selectedTraceNodeIndex,
  pendingPin,
  editingTraceId,
  editingAreaId,
  onFinishTraceDraft,
  onFinishAreaDraft,
  onRemoveSelectedTraceNode,
  onUndoDraft,
  onCancelDraft,
  onClearSelection,
}: MapModeProviderProps) {
  const interactionLocked =
    Boolean(pendingPin) ||
    ((mode === "trace" || mode === "editTrace" || mode === "area" || mode === "editArea") &&
      drawingPath.length > 0) ||
    (mode === "trace" && traceDraftFinalized) ||
    (mode === "area" && areaDraftFinalized);

  const awaitingCollectionSelection =
    (mode === "pin" && !!pendingPin) ||
    (mode === "trace" && traceDraftFinalized) ||
    (mode === "area" && areaDraftFinalized);

  const itemLabel =
    mode === "trace" || mode === "editTrace"
      ? "path"
      : mode === "area" || mode === "editArea"
        ? "zone"
        : "pin";

  return (
    <MapModeContext.Provider
      value={{
        mode,
        setMode,
        drawingPath,
        traceRoutingMode,
        setTraceRoutingMode,
        traceRoutingPending,
        traceRoutingError,
        traceDraftFinalized,
        areaDraftFinalized,
        selectedTraceNodeIndex,
        pendingPin,
        editingTraceId,
        editingAreaId,
        interactionLocked,
        awaitingCollectionSelection,
        itemLabel,
        onFinishTraceDraft,
        onFinishAreaDraft,
        onRemoveSelectedTraceNode,
        onUndoDraft,
        onCancelDraft,
        onClearSelection,
      }}
    >
      {children}
    </MapModeContext.Provider>
  );
}
