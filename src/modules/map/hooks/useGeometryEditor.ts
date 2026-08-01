"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveTrace, updateTrace, deleteTrace,
  saveArea, updateArea, deleteArea,
  savePin, deletePin,
  mergeTraceIntoEndpoint, attachTraceBranch,
  createCollection, deleteCollection,
} from "@/app/actions";
import type { Collection, InteractionMode } from "@/modules/collections/types";
import type { FeatureProperties } from "@/modules/map/types";
import type { EntityNearbyPinRecord } from "@/app/actions";
import type { LayerVisibilityState } from "@/modules/collections/layer-visibility";
import { isLayerVisible } from "@/modules/collections/layer-visibility";
import { removePathPoint } from "@/modules/map/utils/path-editing";
import { shouldAutoOpenLayerDrawer } from "@/modules/collections/layer-logic";
import { routeTraceSegment } from "@/modules/map/services/routing";
import type { MapCoordinate, TraceRoutingMode } from "@/modules/map/types";

const flattenRoutedTrace = (
  anchors: MapCoordinate[],
  segments: MapCoordinate[][]
): MapCoordinate[] => {
  if (anchors.length === 0) return [];
  return [anchors[0], ...segments.flatMap((segment) => segment.slice(1))];
};

export interface GeometryBridge {
  collections: Collection[];
  isMobileViewport: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  targetCollectionId: string;
  setTargetCollectionId: (id: string) => void;
  triggerRefresh: () => void;
  registerCollection: (c: Collection) => void;
  unregisterCollection: (id: string) => void;
  revealCollection: (collectionId: string) => void;
  layerVisibility: LayerVisibilityState;
}

export interface EditingPinData {
  id: string;
  name?: string;
  note?: string;
  image_url?: string;
  collectionId?: string;
}

export interface EditingDraftData {
  id: string;
  name?: string;
  collectionId?: string;
}

interface TraceNetworkTarget {
  traceId: string;
  traceTitle: string;
  collectionId?: string;
  attachment: MapCoordinate;
}

type PendingTraceMerge =
  | {
      kind: "endpoint";
      traceId: string;
      traceTitle: string;
      endpoint: "start" | "end";
    }
  | ({ kind: "branch" } & TraceNetworkTarget);

export function useGeometryEditor(bridge: GeometryBridge) {
  const {
    collections, isMobileViewport, setMobileSidebarOpen,
    setTargetCollectionId, triggerRefresh,
    registerCollection, unregisterCollection, revealCollection,
    layerVisibility,
  } = bridge;

  const [mode, setMode] = useState<InteractionMode>("pin");
  const [selectedPoint, setSelectedPoint] = useState<{ lng: number; lat: number } | null>(null);
  const [drawingPath, setDrawingPath] = useState<{ lng: number; lat: number }[]>([]);
  const [traceRoutingMode, setTraceRoutingMode] = useState<TraceRoutingMode>("direct");
  const [traceAnchors, setTraceAnchors] = useState<MapCoordinate[]>([]);
  const [traceSegments, setTraceSegments] = useState<MapCoordinate[][]>([]);
  const [traceRoutingPending, setTraceRoutingPending] = useState(false);
  const [traceRoutingError, setTraceRoutingError] = useState<string | null>(null);
  const [traceDraftFinalized, setTraceDraftFinalized] = useState(false);
  const [areaDraftFinalized, setAreaDraftFinalized] = useState(false);
  const [editingTraceId, setEditingTraceId] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [selectedTraceNodeIndex, setSelectedTraceNodeIndex] = useState<number | null>(null);
  const [editingTraceCollectionId, setEditingTraceCollectionId] = useState<string | null>(null);
  const [editingAreaCollectionId, setEditingAreaCollectionId] = useState<string | null>(null);
  const [editingPinData, setEditingPinData] = useState<EditingPinData | null>(null);
  const [editingTraceData, setEditingTraceData] = useState<EditingDraftData | null>(null);
  const [editingAreaData, setEditingAreaData] = useState<EditingDraftData | null>(null);
  const [pendingPin, setPendingPin] = useState<{ lng: number; lat: number } | null>(null);
  const [autoCreatedCollectionId, setAutoCreatedCollectionId] = useState<string | null>(null);
  const [autoOpenCollectionId, setAutoOpenCollectionId] = useState<string | null>(null);
  const [pendingTraceMerge, setPendingTraceMerge] = useState<PendingTraceMerge | null>(null);
  const [traceBranchTarget, setTraceBranchTarget] = useState<TraceNetworkTarget | null>(null);
  const [mergeTraceSaving, setMergeTraceSaving] = useState(false);
  const [mapRefreshTick, setMapRefreshTick] = useState(0);
  const geometryPersistTimeoutRef = useRef<number | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);
  const routingInFlightRef = useRef(false);

  const resetGeometry = useCallback(() => {
    routeAbortRef.current?.abort();
    routeAbortRef.current = null;
    routingInFlightRef.current = false;
    setSelectedPoint(null);
    setDrawingPath([]);
    setTraceAnchors([]);
    setTraceSegments([]);
    setTraceRoutingPending(false);
    setTraceRoutingError(null);
    setEditingTraceId(null);
    setEditingAreaId(null);
    setSelectedTraceNodeIndex(null);
    setEditingTraceCollectionId(null);
    setEditingAreaCollectionId(null);
    setEditingTraceData(null);
    setEditingAreaData(null);
    setEditingPinData(null);
    setPendingPin(null);
    setPendingTraceMerge(null);
    setTraceBranchTarget(null);
    setAutoOpenCollectionId(null);
    setTraceDraftFinalized(false);
    setAreaDraftFinalized(false);
  }, []);

  const rebuildRoutedTrace = useCallback(async (anchors: MapCoordinate[]) => {
    routeAbortRef.current?.abort();

    if (anchors.length < 2) {
      setTraceAnchors(anchors);
      setTraceSegments([]);
      setDrawingPath(anchors);
      setTraceRoutingError(null);
      return;
    }

    const controller = new AbortController();
    routeAbortRef.current = controller;
    routingInFlightRef.current = true;
    setTraceRoutingPending(true);
    setTraceRoutingError(null);

    try {
      const segments = await Promise.all(
        anchors.slice(1).map((end, index) =>
          routeTraceSegment(anchors[index], end, { signal: controller.signal })
        )
      );
      setTraceAnchors(anchors);
      setTraceSegments(segments);
      setDrawingPath(flattenRoutedTrace(anchors, segments));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTraceRoutingError("Could not follow streets. Direct segments were used.");
      const fallbackSegments = anchors.slice(1).map((end, index) => [anchors[index], end]);
      setTraceAnchors(anchors);
      setTraceSegments(fallbackSegments);
      setDrawingPath(flattenRoutedTrace(anchors, fallbackSegments));
    } finally {
      if (routeAbortRef.current === controller) {
        routeAbortRef.current = null;
        routingInFlightRef.current = false;
        setTraceRoutingPending(false);
      }
    }
  }, []);

  const handleDataSaved = useCallback(() => {
    resetGeometry();
    setMobileSidebarOpen(false);
    if (mode === "editTrace") setMode("trace");
    if (mode === "editArea") setMode("area");
    if (mode === "editPin") setMode("pin");
    triggerRefresh();
    setMapRefreshTick((v) => v + 1);
  }, [mode, resetGeometry, setMobileSidebarOpen, triggerRefresh]);

  const handleCancel = useCallback(() => {
    const shouldDeleteAutoCollection =
      !!autoCreatedCollectionId &&
      ((mode === "pin" && !!pendingPin) ||
        (mode === "trace" && traceDraftFinalized) ||
        (mode === "area" && areaDraftFinalized));

    resetGeometry();
    if (mode === "editTrace") setMode("trace");
    if (mode === "editArea") setMode("area");
    if (mode === "editPin") setMode("pin");

    if (shouldDeleteAutoCollection) {
      void (async () => {
        try {
          await deleteCollection(autoCreatedCollectionId);
          unregisterCollection(autoCreatedCollectionId);
          setTargetCollectionId("");
          setAutoCreatedCollectionId(null);
          triggerRefresh();
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [autoCreatedCollectionId, areaDraftFinalized, mode, pendingPin, traceDraftFinalized, resetGeometry, setTargetCollectionId, triggerRefresh, unregisterCollection]);

  const finalizeFreshTraceSave = useCallback(
    async (collectionId: string, collectionColor: string) => {
      await saveTrace(drawingPath.map((p) => [p.lng, p.lat]), collectionColor, collectionId);
      setDrawingPath([]);
      setTraceAnchors([]);
      setTraceSegments([]);
      setTraceDraftFinalized(false);
      setAutoOpenCollectionId(null);
      setPendingTraceMerge(null);
      if (isMobileViewport) setMobileSidebarOpen(false);
      triggerRefresh();
      setMapRefreshTick((v) => v + 1);
    },
    [drawingPath, isMobileViewport, setMobileSidebarOpen, triggerRefresh]
  );

  const finalizeMergedTraceSave = useCallback(async () => {
    if (!pendingTraceMerge) return;
    setMergeTraceSaving(true);
    try {
      const coordinates = drawingPath.map((p) => [p.lng, p.lat] as [number, number]);
      if (pendingTraceMerge.kind === "branch") {
        await attachTraceBranch(
          pendingTraceMerge.traceId,
          coordinates,
          [pendingTraceMerge.attachment.lng, pendingTraceMerge.attachment.lat]
        );
      } else {
        await mergeTraceIntoEndpoint(
          pendingTraceMerge.traceId,
          coordinates,
          pendingTraceMerge.endpoint
        );
      }
      setDrawingPath([]);
      setTraceAnchors([]);
      setTraceSegments([]);
      setTraceDraftFinalized(false);
      setAutoOpenCollectionId(null);
      setPendingTraceMerge(null);
      setTraceBranchTarget(null);
      if (isMobileViewport) setMobileSidebarOpen(false);
      triggerRefresh();
      setMapRefreshTick((v) => v + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setMergeTraceSaving(false);
    }
  }, [drawingPath, isMobileViewport, pendingTraceMerge, setMobileSidebarOpen, triggerRefresh]);

  const confirmCollectionSelection = useCallback(
    async (collectionId: string) => {
      revealCollection(collectionId);
      try {
        if (pendingPin) {
          await savePin(pendingPin.lng, pendingPin.lat, collectionId, "Untitled Marker");
          setPendingPin(null);
          setSelectedPoint(null);
          setAutoOpenCollectionId(null);
          if (isMobileViewport) setMobileSidebarOpen(false);
          triggerRefresh();
          setMapRefreshTick((v) => v + 1);
          return;
        }
        if (mode === "trace" && traceDraftFinalized && drawingPath.length >= 2) {
          const color = collections.find((c) => c.id === collectionId)?.color || "#0000ff";
          await finalizeFreshTraceSave(collectionId, color);
          return;
        }
        if (mode === "area" && areaDraftFinalized && drawingPath.length >= 3) {
          const color = collections.find((c) => c.id === collectionId)?.color || "#10b981";
          await saveArea(drawingPath.map((p) => [p.lng, p.lat]), color, collectionId);
          setDrawingPath([]);
          setAreaDraftFinalized(false);
          setAutoOpenCollectionId(null);
          if (isMobileViewport) setMobileSidebarOpen(false);
          triggerRefresh();
          setMapRefreshTick((v) => v + 1);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [areaDraftFinalized, collections, drawingPath, finalizeFreshTraceSave, isMobileViewport, mode, pendingPin, revealCollection, setMobileSidebarOpen, traceDraftFinalized, triggerRefresh]
  );

  const handleMapClick = useCallback(
    async (lng: number, lat: number) => {
      if (isMobileViewport) setMobileSidebarOpen(false);
      if (mode === "pin") {
        setPendingPin({ lng, lat });
        setSelectedPoint({ lng, lat });
        if (collections.length === 0 && !autoCreatedCollectionId) {
          try {
            const newCollection = await createCollection("undefined", "#0000ff", "!", "pin");
            registerCollection(newCollection);
            setTargetCollectionId(newCollection.id);
            setAutoCreatedCollectionId(newCollection.id);
            setAutoOpenCollectionId(newCollection.id);
          } catch (error) {
            console.error(error);
          }
        }
      } else if (mode === "trace") {
        if (traceDraftFinalized) return;
        const nextPoint = { lng, lat };
        if (traceRoutingMode === "direct") {
          setDrawingPath((p) => [...p, nextPoint]);
          return;
        }
        if (routingInFlightRef.current) return;
        if (traceAnchors.length === 0) {
          setTraceAnchors([nextPoint]);
          setDrawingPath([nextPoint]);
          setTraceRoutingError(null);
          return;
        }

        const start = traceAnchors[traceAnchors.length - 1];
        const controller = new AbortController();
        routeAbortRef.current?.abort();
        routeAbortRef.current = controller;
        routingInFlightRef.current = true;
        setTraceRoutingPending(true);
        setTraceRoutingError(null);

        try {
          const segment = await routeTraceSegment(start, nextPoint, { signal: controller.signal });
          const nextAnchors = [...traceAnchors, nextPoint];
          const nextSegments = [...traceSegments, segment];
          setTraceAnchors(nextAnchors);
          setTraceSegments(nextSegments);
          setDrawingPath(flattenRoutedTrace(nextAnchors, nextSegments));
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            const nextAnchors = [...traceAnchors, nextPoint];
            const nextSegments = [...traceSegments, [start, nextPoint]];
            setTraceAnchors(nextAnchors);
            setTraceSegments(nextSegments);
            setDrawingPath(flattenRoutedTrace(nextAnchors, nextSegments));
            setTraceRoutingError("Could not follow streets. A direct segment was used.");
          }
        } finally {
          if (routeAbortRef.current === controller) {
            routeAbortRef.current = null;
            routingInFlightRef.current = false;
            setTraceRoutingPending(false);
          }
        }
      } else if (mode === "area") {
        if (areaDraftFinalized) return;
        setDrawingPath((p) => [...p, { lng, lat }]);
      }
    },
    [areaDraftFinalized, autoCreatedCollectionId, collections.length, isMobileViewport, mode, registerCollection, setMobileSidebarOpen, setTargetCollectionId, traceAnchors, traceDraftFinalized, traceRoutingMode, traceSegments]
  );

  const handleTraceAnchorChange = useCallback(
    (index: number, coordinate: MapCoordinate) => {
      if (traceRoutingMode !== "pedestrian" || traceRoutingPending) return;
      const nextAnchors = traceAnchors.map((anchor, anchorIndex) =>
        anchorIndex === index ? coordinate : anchor
      );
      void rebuildRoutedTrace(nextAnchors);
    },
    [rebuildRoutedTrace, traceAnchors, traceRoutingMode, traceRoutingPending]
  );

  const handlePendingPinCancel = useCallback(async () => {
    setPendingPin(null);
    setSelectedPoint(null);
    setAutoOpenCollectionId(null);
    if (autoCreatedCollectionId) {
      try {
        await deleteCollection(autoCreatedCollectionId);
        unregisterCollection(autoCreatedCollectionId);
        setTargetCollectionId("");
        setAutoCreatedCollectionId(null);
        triggerRefresh();
        setMapRefreshTick((v) => v + 1);
      } catch (error) {
        console.error(error);
      }
    }
  }, [autoCreatedCollectionId, setTargetCollectionId, triggerRefresh, unregisterCollection]);

  const handleTraceSelected = useCallback(
    (id: string, coordinates: { lng: number; lat: number }[], properties?: FeatureProperties) => {
      setMobileSidebarOpen(false);
      setMode("editTrace");
      setEditingTraceId(id);
      setEditingTraceData({
        id,
        name: typeof properties?.name === "string" ? properties.name : undefined,
        collectionId: typeof properties?.collection_id === "string" ? properties.collection_id : undefined,
      });
      setEditingTraceCollectionId((properties?.collection_id as string | undefined) || null);
      setSelectedTraceNodeIndex(null);
      setDrawingPath(coordinates);
      setTraceAnchors([]);
      setTraceSegments([]);
      setTraceDraftFinalized(false);
      setEditingAreaId(null);
      setEditingAreaData(null);
      setEditingPinData(null);
      setSelectedPoint(null);
    },
    [setMobileSidebarOpen]
  );

  const handleAreaSelected = useCallback(
    (id: string, coordinates: { lng: number; lat: number }[], properties?: FeatureProperties) => {
      setMobileSidebarOpen(false);
      setMode("editArea");
      setEditingAreaId(id);
      setEditingAreaData({
        id,
        name: typeof properties?.name === "string" ? properties.name : undefined,
        collectionId: typeof properties?.collection_id === "string" ? properties.collection_id : undefined,
      });
      setEditingAreaCollectionId((properties?.collection_id as string | undefined) || null);
      setSelectedTraceNodeIndex(null);
      setDrawingPath(coordinates);
      setAreaDraftFinalized(false);
      setEditingTraceId(null);
      setEditingTraceData(null);
      setEditingPinData(null);
      setSelectedPoint(null);
    },
    [setMobileSidebarOpen]
  );

  const handlePinSelected = useCallback(
    (id: string, properties: FeatureProperties) => {
      setMobileSidebarOpen(false);
      setMode("editPin");
      setEditingPinData({
        id,
        note: properties.note,
        image_url: properties.image_url,
        name: properties.name,
        collectionId: properties.collection_id,
      });
      setSelectedPoint(null);
    },
    [setMobileSidebarOpen]
  );

  const handleOpenNearbyPin = useCallback(
    (nearbyPin: EntityNearbyPinRecord) => {
      setMobileSidebarOpen(false);
      setMode("editPin");
      setEditingPinData({
        id: nearbyPin.id,
        name: nearbyPin.title,
        image_url: nearbyPin.imageUrl ?? undefined,
        collectionId: nearbyPin.collectionId ?? undefined,
      });
      setSelectedPoint(null);
    },
    [setMobileSidebarOpen]
  );

  const handleDeleteSavedPin = useCallback(
    async (pinId: string) => {
      try {
        await deletePin(pinId);
        setEditingPinData(null);
        setMode("pin");
        triggerRefresh();
        setMapRefreshTick((v) => v + 1);
      } catch (error) {
        console.error(error);
      }
    },
    [triggerRefresh]
  );

  const handleFinishTraceDraft = useCallback(() => {
    if (drawingPath.length < 2) return;
    setSelectedTraceNodeIndex(null);
    setTraceDraftFinalized(true);
    if (traceBranchTarget) {
      setPendingTraceMerge({ kind: "branch", ...traceBranchTarget });
      return;
    }
    if (collections.length === 0 && !autoCreatedCollectionId) {
      void (async () => {
        try {
          const newCollection = await createCollection("undefined", "#0000ff", "!", "trace");
          registerCollection(newCollection);
          setTargetCollectionId(newCollection.id);
          setAutoCreatedCollectionId(newCollection.id);
          setAutoOpenCollectionId(newCollection.id);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [autoCreatedCollectionId, collections.length, drawingPath.length, registerCollection, setTargetCollectionId, traceBranchTarget]);

  const handleFinishAreaDraft = useCallback(() => {
    if (drawingPath.length < 3) return;
    setSelectedTraceNodeIndex(null);
    setAreaDraftFinalized(true);
    if (collections.length === 0 && !autoCreatedCollectionId) {
      void (async () => {
        try {
          const newCollection = await createCollection("undefined", "#10b981", "!", "area");
          registerCollection(newCollection);
          setTargetCollectionId(newCollection.id);
          setAutoCreatedCollectionId(newCollection.id);
          setAutoOpenCollectionId(newCollection.id);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [autoCreatedCollectionId, collections.length, drawingPath.length, registerCollection, setTargetCollectionId]);

  const handleTraceNodeClick = useCallback(
    (nodeIndex: number) => {
      if ((!mode.includes("trace") && !mode.includes("area")) || traceDraftFinalized || areaDraftFinalized) return;
      setSelectedTraceNodeIndex((current) => (current === nodeIndex ? null : nodeIndex));
    },
    [areaDraftFinalized, mode, traceDraftFinalized]
  );

  const handleRemoveSelectedTraceNode = useCallback(async () => {
    if (selectedTraceNodeIndex === null) return;
    if (mode === "trace" && traceRoutingMode === "pedestrian") {
      const nextAnchors = traceAnchors.filter((_, index) => index !== selectedTraceNodeIndex);
      setSelectedTraceNodeIndex(null);
      if (nextAnchors.length === 0) {
        handleCancel();
        return;
      }
      await rebuildRoutedTrace(nextAnchors);
      return;
    }
    const nextPath = removePathPoint(drawingPath, selectedTraceNodeIndex);
    setSelectedTraceNodeIndex(null);
    if (mode === "trace" || mode === "area") {
      if (nextPath.length === 0) { handleCancel(); return; }
      setDrawingPath(nextPath);
      return;
    }
    if (mode === "editTrace" && editingTraceId) {
      if (nextPath.length < 2) {
        await deleteTrace(editingTraceId);
        setEditingTraceId(null);
        setEditingTraceCollectionId(null);
        setDrawingPath([]);
        setMode("trace");
      } else {
        setDrawingPath(nextPath);
        await updateTrace(editingTraceId, nextPath.map((p) => [p.lng, p.lat]));
      }
      triggerRefresh();
      setMapRefreshTick((v) => v + 1);
    }
  }, [drawingPath, editingTraceId, handleCancel, mode, rebuildRoutedTrace, selectedTraceNodeIndex, traceAnchors, traceRoutingMode, triggerRefresh]);

  const handleTraceLineMergeRequest = useCallback(
    async (trace: { id: string; name?: string; collectionId?: string; coordinates: MapCoordinate }) => {
      if (mode !== "trace" || traceDraftFinalized || traceRoutingPending) return;
      if (traceBranchTarget && traceBranchTarget.traceId !== trace.id) return;

      const target: TraceNetworkTarget = {
        traceId: trace.id,
        traceTitle: trace.name || "Untitled Path",
        collectionId: trace.collectionId,
        attachment: trace.coordinates,
      };

      if (drawingPath.length === 0) {
        setTraceBranchTarget(target);
        setSelectedTraceNodeIndex(null);
        setTraceAnchors([trace.coordinates]);
        setTraceSegments([]);
        setDrawingPath([trace.coordinates]);
        setTraceRoutingError(null);
        return;
      }

      await handleMapClick(trace.coordinates.lng, trace.coordinates.lat);
      setPendingTraceMerge({ kind: "branch", ...(traceBranchTarget ?? target) });
    },
    [drawingPath.length, handleMapClick, mode, traceBranchTarget, traceDraftFinalized, traceRoutingPending]
  );

  const handleTraceAnchorMergeRequest = useCallback(
    (trace: { id: string; name?: string; collectionId?: string; endpoint: "start" | "end"; coordinates: { lng: number; lat: number } }) => {
      if (mode !== "trace" || traceDraftFinalized || drawingPath.length < 2) return;
      if (traceBranchTarget) {
        void handleTraceLineMergeRequest(trace);
        return;
      }
      setPendingTraceMerge({ kind: "endpoint", traceId: trace.id, traceTitle: trace.name || "Untitled Path", endpoint: trace.endpoint });
    },
    [drawingPath.length, handleTraceLineMergeRequest, mode, traceBranchTarget, traceDraftFinalized]
  );

  const cancelPendingTraceMerge = useCallback(() => {
    setPendingTraceMerge(null);
    setTraceDraftFinalized(false);
  }, []);

  const handleUndo = useCallback(async () => {
    if (drawingPath.length === 0) return;
    if (mode === "trace") {
      if (traceDraftFinalized) { setTraceDraftFinalized(false); return; }
      if (traceRoutingMode === "pedestrian") {
        if (traceRoutingPending) return;
        const nextAnchors = traceAnchors.slice(0, -1);
        setSelectedTraceNodeIndex(null);
        if (nextAnchors.length === 0) {
          setTraceBranchTarget(null);
        }
        if (nextAnchors.length < 2) {
          setTraceAnchors(nextAnchors);
          setTraceSegments([]);
          setDrawingPath(nextAnchors);
        } else {
          const nextSegments = traceSegments.slice(0, -1);
          setTraceAnchors(nextAnchors);
          setTraceSegments(nextSegments);
          setDrawingPath(flattenRoutedTrace(nextAnchors, nextSegments));
        }
        return;
      }
      if (drawingPath.length === 1) {
        setTraceBranchTarget(null);
      }
      setDrawingPath((p) => p.slice(0, -1));
      setSelectedTraceNodeIndex((i) => (i === null ? null : i >= drawingPath.length - 1 ? Math.max(drawingPath.length - 2, 0) : i));
      return;
    }
    if (mode === "area") {
      if (areaDraftFinalized) { setAreaDraftFinalized(false); return; }
      setDrawingPath((p) => p.slice(0, -1));
      setSelectedTraceNodeIndex((i) => (i === null ? null : i >= drawingPath.length - 1 ? Math.max(drawingPath.length - 2, 0) : i));
      return;
    }
    const newPath = drawingPath.slice(0, -1);
    setDrawingPath(newPath);
    setSelectedTraceNodeIndex((i) => (i === null || newPath.length === 0 ? null : i >= newPath.length ? newPath.length - 1 : i));
    if (mode === "editTrace" && editingTraceId) {
      if (newPath.length < 2) { await deleteTrace(editingTraceId); setEditingTraceId(null); setMode("trace"); }
      else { await updateTrace(editingTraceId, newPath.map((p) => [p.lng, p.lat])); }
      triggerRefresh(); setMapRefreshTick((v) => v + 1);
    } else if (mode === "editArea" && editingAreaId) {
      if (newPath.length < 3) { await deleteArea(editingAreaId); setEditingAreaId(null); setMode("area"); }
      else { await updateArea(editingAreaId, newPath.map((p) => [p.lng, p.lat])); }
      triggerRefresh(); setMapRefreshTick((v) => v + 1);
    }
  }, [areaDraftFinalized, drawingPath, editingAreaId, editingTraceId, mode, traceAnchors, traceDraftFinalized, traceRoutingMode, traceRoutingPending, traceSegments, triggerRefresh]);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "pin" && pendingPin) { setPendingPin(null); setSelectedPoint(null); }
  }, [mode, pendingPin]);

  useEffect(() => {
    if (!editingPinData?.collectionId) return;
    if (!isLayerVisible(layerVisibility, editingPinData.collectionId)) {
      setEditingPinData(null);
      if (mode === "editPin") setMode("pin");
    }
  }, [editingPinData, layerVisibility, mode]);

  useEffect(() => {
    if (!editingTraceId || !editingTraceCollectionId) return;
    if (!isLayerVisible(layerVisibility, editingTraceCollectionId)) {
      setEditingTraceId(null); setEditingTraceData(null); setEditingTraceCollectionId(null); setDrawingPath([]);
      if (mode === "editTrace") setMode("trace");
    }
  }, [editingTraceCollectionId, editingTraceId, layerVisibility, mode]);

  useEffect(() => {
    if (!editingAreaId || !editingAreaCollectionId) return;
    if (!isLayerVisible(layerVisibility, editingAreaCollectionId)) {
      setEditingAreaId(null); setEditingAreaData(null); setEditingAreaCollectionId(null); setDrawingPath([]);
      if (mode === "editArea") setMode("area");
    }
  }, [editingAreaCollectionId, editingAreaId, layerVisibility, mode]);

  useEffect(() => { if (mode !== "trace" && traceDraftFinalized) setTraceDraftFinalized(false); }, [mode, traceDraftFinalized]);
  useEffect(() => { if (mode !== "trace" && pendingTraceMerge) setPendingTraceMerge(null); }, [mode, pendingTraceMerge]);
  useEffect(() => { if (mode !== "area" && areaDraftFinalized) setAreaDraftFinalized(false); }, [mode, areaDraftFinalized]);

  useEffect(() => {
    if (selectedTraceNodeIndex !== null && selectedTraceNodeIndex >= drawingPath.length) {
      setSelectedTraceNodeIndex(drawingPath.length > 0 ? drawingPath.length - 1 : null);
    }
  }, [drawingPath.length, selectedTraceNodeIndex]);

  useEffect(() => {
    if (!isMobileViewport) return;
    if (shouldAutoOpenLayerDrawer(isMobileViewport, mode, !!pendingPin, traceDraftFinalized, areaDraftFinalized)) {
      setMobileSidebarOpen(true);
    }
  }, [areaDraftFinalized, isMobileViewport, mode, pendingPin, setMobileSidebarOpen, traceDraftFinalized]);

  useEffect(() => {
    if (autoCreatedCollectionId && !collections.some((c) => c.id === autoCreatedCollectionId)) {
      setAutoCreatedCollectionId(null);
    }
  }, [autoCreatedCollectionId, collections]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isTextInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (isTextInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        void handleUndo();
        return;
      }

      if (e.key === "Escape") {
        if (pendingTraceMerge) {
          e.preventDefault();
          cancelPendingTraceMerge();
          return;
        }

        const hasActiveGeometryDraft =
          (mode === "trace" || mode === "area") &&
          (drawingPath.length > 0 || traceDraftFinalized || areaDraftFinalized);

        if (hasActiveGeometryDraft) {
          e.preventDefault();
          handleCancel();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [areaDraftFinalized, cancelPendingTraceMerge, drawingPath.length, handleCancel, handleUndo, mode, pendingTraceMerge, traceDraftFinalized]);

  useEffect(() => {
    if (geometryPersistTimeoutRef.current !== null) {
      window.clearTimeout(geometryPersistTimeoutRef.current);
      geometryPersistTimeoutRef.current = null;
    }
    if (mode === "editTrace" && editingTraceId && drawingPath.length >= 2) {
      geometryPersistTimeoutRef.current = window.setTimeout(() => {
        void (async () => {
          try {
            await updateTrace(editingTraceId, drawingPath.map((p) => [p.lng, p.lat]));
            triggerRefresh(); setMapRefreshTick((v) => v + 1);
          } catch (error) { console.error(error); }
        })();
      }, 180);
    }
    if (mode === "editArea" && editingAreaId && drawingPath.length >= 3) {
      geometryPersistTimeoutRef.current = window.setTimeout(() => {
        void (async () => {
          try {
            await updateArea(editingAreaId, drawingPath.map((p) => [p.lng, p.lat]));
            triggerRefresh(); setMapRefreshTick((v) => v + 1);
          } catch (error) { console.error(error); }
        })();
      }, 180);
    }
    return () => {
      if (geometryPersistTimeoutRef.current !== null) {
        window.clearTimeout(geometryPersistTimeoutRef.current);
        geometryPersistTimeoutRef.current = null;
      }
    };
  }, [drawingPath, editingAreaId, editingTraceId, mode, triggerRefresh]);

  return {
    mode, setMode,
    selectedPoint, setSelectedPoint,
    drawingPath, setDrawingPath,
    traceRoutingMode, setTraceRoutingMode,
    traceAnchors,
    traceRoutingPending,
    traceRoutingError,
    traceDraftFinalized,
    areaDraftFinalized,
    editingTraceId, setEditingTraceId,
    editingAreaId, setEditingAreaId,
    selectedTraceNodeIndex,
    editingPinData, setEditingPinData,
    editingTraceData, setEditingTraceData,
    editingAreaData, setEditingAreaData,
    editingTraceCollectionId, setEditingTraceCollectionId,
    editingAreaCollectionId, setEditingAreaCollectionId,
    pendingPin,
    autoOpenCollectionId,
    pendingTraceMerge, setPendingTraceMerge,
    traceBranchTarget,
    mergeTraceSaving,
    mapRefreshTick,
    handleMapClick,
    handleTraceAnchorChange,
    handleTraceSelected,
    handleAreaSelected,
    handlePinSelected,
    handleOpenNearbyPin,
    handleDeleteSavedPin,
    handlePendingPinCancel,
    handleTraceAnchorMergeRequest,
    handleTraceLineMergeRequest,
    cancelPendingTraceMerge,
    handleFinishTraceDraft,
    handleFinishAreaDraft,
    handleTraceNodeClick,
    handleRemoveSelectedTraceNode,
    handleUndo,
    handleDataSaved,
    handleCancel,
    finalizeMergedTraceSave,
    confirmCollectionSelection,
  };
}
