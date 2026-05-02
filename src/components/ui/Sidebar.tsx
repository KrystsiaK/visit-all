"use client";

import * as React from "react";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { createCollection } from "@/app/actions";
import type { InteractionMode, Collection } from "@/app/page";
import { ShellSlot } from "@synarava/shell-kit";
import type { LeftSidebarShellConfig } from "@/lib/shells";
import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";
import { LeftSidebarShell } from "@/components/shells/LeftSidebarShell";
import { ShellCollectionsWidget } from "@/components/widgets/shell-widgets/ShellCollectionsWidget";
import { ShellControlsWidget } from "@/components/widgets/shell-widgets/ShellControlsWidget";
import { ShellCreateCollectionWidget } from "@/components/widgets/shell-widgets/ShellCreateCollectionWidget";
import { ShellFinishTraceWidget } from "@/components/widgets/shell-widgets/ShellFinishTraceWidget";
import { ShellModeSwitchWidget } from "@/components/widgets/shell-widgets/ShellModeSwitchWidget";
import { ShellRemoveTracePointWidget } from "@/components/widgets/shell-widgets/ShellRemoveTracePointWidget";
import { ShellResetViewWidget } from "@/components/widgets/shell-widgets/ShellResetViewWidget";
import { ShellSearchWidget } from "@/components/widgets/shell-widgets/ShellSearchWidget";
import { ShellChromePrimaryWidget } from "@/components/widgets/shell-widgets/ShellChromePrimaryWidget";
import { useShellCollectionsBinding } from "@/components/widgets/shell-widgets/collections/useShellCollectionsBinding";
import { useShellRuntimeActions, useShellRuntimeValue } from "@synarava/shell-kit";
import { type LayerVisibilityState } from "@/lib/layer-visibility";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { useShellWidgetReorder } from "@synarava/shell-kit";

interface SidebarProps {
  mode: InteractionMode;
  setMode: (val: InteractionMode) => void;
  selectedPoint?: { lng: number; lat: number } | null;
  drawingPath: { lng: number; lat: number }[];
  editingTraceId: string | null;
  editingAreaId: string | null;
  traceDraftFinalized: boolean;
  areaDraftFinalized: boolean;
  curveMode: boolean;
  setCurveMode: (val: boolean) => void;
  terrain3D: boolean;
  setTerrain3D: (val: boolean) => void;
  isSatellite: boolean;
  setIsSatellite: (val: boolean) => void;
  onResetView: () => void;
  onClearSelection: () => void;
  onUndo: () => void;
  onDataSaved: () => void;
  isMobileViewport?: boolean;
  mobileSidebarOpen?: boolean;
  setMobileSidebarOpen?: (val: boolean) => void;
  desktopSidebarVisible?: boolean;
  onToggleDesktopSidebar?: () => void;
  sidebarReady?: boolean;
  shellConfig?: LeftSidebarShellConfig;
  shellId?: string;
  shellWidgets?: Array<WidgetPlacementRecord & WidgetInstanceRecord>;
  onShellWidgetsReorder?: (nextWidgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>) => void;
  shellWidgetsLoaded?: boolean;
  collectionsLoaded?: boolean;
  collections: Collection[];
  layerVisibility: LayerVisibilityState;
  setCollections: Dispatch<SetStateAction<Collection[]>>;
  targetCollectionId: string;
  setTargetCollectionId: (val: string) => void;
  pendingPin: { lng: number; lat: number } | null;
  onCollectionConfirm: (collectionId: string) => Promise<void>;
  onToggleCollectionVisibility: (collectionId: string) => void;
  onShowOnlyCollection: (collectionId: string) => void;
  autoOpenCollectionId: string | null;
  onFinishTraceDraft: () => void;
  onFinishAreaDraft: () => void;
  selectedTraceNodeIndex?: number | null;
  onRemoveSelectedTraceNode?: () => void;
}

export default function Sidebar({ 
  mode, setMode, drawingPath, 
  traceDraftFinalized,
  areaDraftFinalized,
  curveMode, setCurveMode, terrain3D, setTerrain3D, isSatellite, setIsSatellite, onResetView,
  onClearSelection, onDataSaved,
  isMobileViewport = false,
  mobileSidebarOpen, setMobileSidebarOpen,
  desktopSidebarVisible = true, onToggleDesktopSidebar, sidebarReady = false, shellConfig, shellId = "left_sidebar", shellWidgets = [], collectionsLoaded = false,
  onShellWidgetsReorder,
  collections, layerVisibility, setCollections, targetCollectionId, setTargetCollectionId
  , pendingPin, onCollectionConfirm, onToggleCollectionVisibility, onShowOnlyCollection, autoOpenCollectionId, onFinishTraceDraft, onFinishAreaDraft, selectedTraceNodeIndex = null, onRemoveSelectedTraceNode
}: SidebarProps) {
  
  const awaitingLayerSelection =
    (mode === "pin" && !!pendingPin) ||
    (mode === "trace" && traceDraftFinalized) ||
    (mode === "area" && areaDraftFinalized);

  const shellInteractionLocked =
    Boolean(pendingPin) ||
    (((mode === "trace" || mode === "editTrace" || mode === "area" || mode === "editArea") &&
      drawingPath.length > 0) ||
      (mode === "trace" && traceDraftFinalized) ||
      (mode === "area" && areaDraftFinalized));

  const itemLabel =
    mode === "trace" || mode === "editTrace"
      ? "path"
      : mode === "area" || mode === "editArea"
        ? "zone"
        : "pin";

  const desktopWidth = shellConfig?.width ?? 360;
  const orderedShellWidgets = useMemo(
    () => [...shellWidgets].sort((left, right) => left.position - right.position),
    [shellWidgets]
  );
  const pinnedShellWidgets = useMemo(
    () => {
      const explicitPinned = orderedShellWidgets.filter(
        (widget) => widget.slot === "pinned" && widget.componentKey !== "shell_header"
      );
      if (explicitPinned.length > 0) {
        return explicitPinned;
      }

      return [];
    },
    [orderedShellWidgets]
  );
  const mainShellWidgets = useMemo(
    () =>
      orderedShellWidgets.filter(
        (widget) =>
          widget.componentKey !== "shell_header" &&
          !pinnedShellWidgets.some((pinnedWidget) => pinnedWidget.id === widget.id)
      ),
    [orderedShellWidgets, pinnedShellWidgets]
  );
  const [creatingCollection, setCreatingCollection] = useState(false);

  const {
    saving: collectionBindingSaving,
    displayCollections,
    highlightedCollectionId,
    editingCollectionId,
    editingCollection,
    primaryActionLabel,
    selectionCommitPendingId,
    setEditingCollection,
    openCollectionEditor,
    collectionPendingDelete,
    setCollectionPendingDelete,
    handleEditCollectionChange,
    handleCollectionCardClick,
    handleCollectionDone,
    handleDeleteCollection,
  } = useShellCollectionsBinding({
    mode,
    collections,
    setCollections,
    targetCollectionId,
    setTargetCollectionId,
    awaitingCollectionSelection: awaitingLayerSelection,
    autoOpenCollectionId,
    onCollectionConfirm,
    onDataSaved,
    setMobileSidebarOpen,
  });

  const leftSidebarInitialState = useMemo(
    () => ({
      collectionQuery: "",
      interactionMode: mode,
      areasDisabled: false,
      interactionLocked: shellInteractionLocked,
      highlightedCollectionId,
      editingCollectionId,
    }),
    [mode, shellInteractionLocked, highlightedCollectionId, editingCollectionId]
  );

  const saving = collectionBindingSaving || creatingCollection;

  const handleCreateCollection = async () => {
    setCreatingCollection(true);
    try {
      // Derive collection type from current mode
      const collType = mode === 'trace' || mode === 'editTrace' ? 'trace' 
                     : mode === 'area' || mode === 'editArea' ? 'area' 
                     : 'pin';
      const newCol = await createCollection("UNTITLED LAYER", "#0000ff", "!", collType);
      setCollections((currentCollections) => [newCol, ...currentCollections]);
      openCollectionEditor(newCol);
      setTargetCollectionId(newCol.id);
    } catch (error) { console.error(error); }
    finally { setCreatingCollection(false) }
  };

  const {
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useShellWidgetReorder({
    shellId: shellId ?? "left_sidebar",
    widgets: mainShellWidgets,
    onReorder: onShellWidgetsReorder,
  });

  const renderShellWidget = (widget: WidgetPlacementRecord & WidgetInstanceRecord) => {
    let content: React.ReactNode = null;
    let shouldRender = true;

    if (widget.componentKey === "shell_header") {
      return null;
    } else if (widget.componentKey === "shell_search") {
      content = <ShellSearchWidget />;
    } else if (widget.componentKey === "shell_mode_switch") {
      content = (
        <ShellModeSwitchWidget
          config={widget.config}
          onValueCommit={(value) => {
            setMode(value as InteractionMode);
            onClearSelection();
            setEditingCollection(null);
          }}
        />
      );
    } else if (widget.componentKey === "shell_collections") {
      content = (
        <ShellCollectionsWidget
          collections={displayCollections}
          collectionsLoaded={collectionsLoaded}
          highlightedCollectionId={highlightedCollectionId}
          editingCollection={editingCollection}
          editingCollectionId={editingCollectionId}
          itemLabel={itemLabel}
          layerVisibility={layerVisibility}
          awaitingCollectionSelection={awaitingLayerSelection}
          primaryActionLabel={primaryActionLabel}
          selectionCommitPendingId={selectionCommitPendingId}
          saving={saving}
          onCollectionClick={handleCollectionCardClick}
          onToggleCollectionVisibility={onToggleCollectionVisibility}
          onShowOnlyCollection={onShowOnlyCollection}
          onCollectionNameChange={(value) => handleEditCollectionChange("name", value)}
          onCollectionColorChange={(value) => handleEditCollectionChange("color", value)}
          onCollectionDone={handleCollectionDone}
          onRequestDeleteCollection={setCollectionPendingDelete}
        />
      );
    } else if (widget.componentKey === "shell_controls") {
      content = (
        <ShellControlsWidget
          isSatellite={isSatellite}
          setIsSatellite={setIsSatellite}
          terrain3D={terrain3D}
          setTerrain3D={setTerrain3D}
          curveMode={curveMode}
          setCurveMode={setCurveMode}
          disabled={shellInteractionLocked}
        />
      );
    } else if (widget.componentKey === "shell_create_collection") {
      content = (
        <ShellCreateCollectionWidget
          onCreateCollection={() => void handleCreateCollection()}
          saving={saving}
        />
      );
    } else if (widget.componentKey === "shell_reset_view") {
      content = <ShellResetViewWidget onResetView={onResetView} disabled={shellInteractionLocked} />;
    } else if (widget.componentKey === "shell_finish_trace") {
      shouldRender =
        (mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized) ||
        (mode === "area" && drawingPath.length >= 3 && !areaDraftFinalized);

      if (shouldRender) {
        content = (
          <ShellFinishTraceWidget
            visible={true}
            title={mode === "area" ? "Finish Zone" : "Finish Path"}
            eyebrow={mode === "area" ? "Zone Ready" : "Path Ready"}
            onFinishTraceDraft={mode === "area" ? onFinishAreaDraft : onFinishTraceDraft}
          />
        );
      }
    } else if (widget.componentKey === "shell_remove_trace_point") {
      shouldRender =
        (mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized) ||
        (mode === "area" && drawingPath.length >= 3 && !areaDraftFinalized);

      if (shouldRender) {
        content = (
          <ShellRemoveTracePointWidget
            visible={true}
            selectedTraceNodeIndex={selectedTraceNodeIndex}
            title={mode === "area" ? "Remove Vertex" : "Remove Point"}
            idleEyebrow={mode === "area" ? "Select Vertex" : "Select Point"}
            readyEyebrow={(index) =>
              mode === "area" ? `Vertex ${index + 1} Ready` : `Point ${index + 1} Ready`
            }
            onRemoveSelectedTraceNode={onRemoveSelectedTraceNode}
          />
        );
      }
    }

    if (!shouldRender || !content) {
      return null;
    }

    return (
      <ShellSlot
        key={widget.id}
        isDragging={draggedWidgetId === widget.id}
        isDropTarget={dropTarget?.widgetId === widget.id}
        dropEdge={dropTarget?.widgetId === widget.id ? dropTarget.edge : null}
        onDragStart={(event) => handleDragStart(event, widget.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => handleDragOver(event, widget.id)}
        onDrop={(event) => handleDrop(event, widget.id)}
      >
        <WidgetErrorBoundary>{content}</WidgetErrorBoundary>
      </ShellSlot>
    );
  };

  return (
    <>
      <div 
        className="absolute top-0 right-0 bottom-0 left-0 z-0 bg-[#ffffff]/0" 
        onClick={onClearSelection} 
      />

      {collectionPendingDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/18 backdrop-blur-sm p-6">
          <div className="w-full max-w-[420px] overflow-hidden rounded-[28px] border border-black/15 bg-[#f8f6f1] shadow-[0px_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex h-3">
              <div className="flex-1 bg-[#ff0000]" />
              <div className="flex-1 bg-[#ffff00]" />
              <div className="flex-1 bg-[#0000ff]" />
            </div>
            <div className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-500">Delete Layer</p>
              <h3 className="mt-3 text-[28px] leading-[0.95] font-black uppercase tracking-tight text-neutral-950">
                {collectionPendingDelete.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-neutral-700">
                This layer and all of its pins, paths, and zones will be permanently deleted.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-black/10">
              <button
                onClick={() => setCollectionPendingDelete(null)}
                className="h-16 bg-[#f8f6f1] text-sm font-black uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteCollection(collectionPendingDelete.id)}
                disabled={saving}
                className="h-16 border-l border-black/10 bg-[#111111] text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#ff0000]"
              >
                {saving ? "Deleting..." : "Delete Layer"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {(isMobileViewport || sidebarReady) && (
        <LeftSidebarShell
          key={`${shellId}:${isMobileViewport ? "mobile" : desktopSidebarVisible ? "open" : "collapsed"}`}
          shellId={shellId}
          isOpen={isMobileViewport ? Boolean(mobileSidebarOpen) : true}
          collapsed={!isMobileViewport && !desktopSidebarVisible}
          shellWidth={desktopWidth}
          initialState={leftSidebarInitialState}
          onCloseMobile={() => setMobileSidebarOpen?.(false)}
          pinnedChildren={
            isMobileViewport ? (
              pinnedShellWidgets.map((widget) => renderShellWidget(widget))
            ) : (
              <ShellChromePrimaryWidget
                desktopSidebarVisible={desktopSidebarVisible}
                mobileSidebarOpen={Boolean(mobileSidebarOpen)}
                shellWidth={desktopWidth}
                onToggleDesktopSidebar={() => onToggleDesktopSidebar?.()}
                onToggleMobileSidebar={() => setMobileSidebarOpen?.(!Boolean(mobileSidebarOpen))}
              />
            )
          }
        >
          <ShellRuntimeModeSync mode={mode} />
          <ShellRuntimeInteractionLockSync interactionLocked={shellInteractionLocked} />
          <ShellRuntimeCollectionSelectionSync
            highlightedCollectionId={highlightedCollectionId}
            editingCollectionId={editingCollectionId}
          />
          {mainShellWidgets.map((widget) => renderShellWidget(widget))}
        </LeftSidebarShell>
      )}
    </>
  );
}

function ShellRuntimeInteractionLockSync({
  interactionLocked,
}: {
  interactionLocked: boolean;
}) {
  const runtimeInteractionLocked = useShellRuntimeValue("interactionLocked", false);
  const { setValue } = useShellRuntimeActions();

  useEffect(() => {
    if (runtimeInteractionLocked !== interactionLocked) {
      setValue("interactionLocked", interactionLocked);
    }
  }, [interactionLocked, runtimeInteractionLocked, setValue]);

  return null;
}

function ShellRuntimeModeSync({
  mode,
}: {
  mode: InteractionMode;
}) {
  const runtimeMode = useShellRuntimeValue<InteractionMode>("interactionMode", "pin");
  const { setValue } = useShellRuntimeActions();

  useEffect(() => {
    const normalizedMode = normalizeRuntimeMode(mode);

    if (normalizedMode !== runtimeMode) {
      setValue("interactionMode", normalizedMode);
    }
  }, [mode, runtimeMode, setValue]);

  return null;
}

function normalizeRuntimeMode(mode: InteractionMode): InteractionMode {
  if (mode === "editTrace") {
    return "trace";
  }

  if (mode === "editArea") {
    return "area";
  }

  if (mode === "editPin") {
    return "pin";
  }

  return mode;
}

function ShellRuntimeCollectionSelectionSync({
  highlightedCollectionId,
  editingCollectionId,
}: {
  highlightedCollectionId: string;
  editingCollectionId: string | null;
}) {
  const runtimeHighlightedCollectionId = useShellRuntimeValue("highlightedCollectionId", "");
  const runtimeEditingCollectionId = useShellRuntimeValue<string | null>("editingCollectionId", null);
  const { patchState } = useShellRuntimeActions();

  useEffect(() => {
    if (
      runtimeHighlightedCollectionId !== highlightedCollectionId ||
      runtimeEditingCollectionId !== editingCollectionId
    ) {
      patchState({
        highlightedCollectionId,
        editingCollectionId,
      });
    }
  }, [
    highlightedCollectionId,
    editingCollectionId,
    patchState,
    runtimeHighlightedCollectionId,
    runtimeEditingCollectionId,
  ]);

  return null;
}
