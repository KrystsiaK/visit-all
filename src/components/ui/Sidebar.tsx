"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { createCollection } from "@/app/actions";
import type { InteractionMode, Collection } from "@/app/page";
import { motion, type HTMLMotionProps } from "framer-motion";
import { ShellWidgetSlot } from "@/components/shells/ShellWidgetSlot";
import { sidebarShellVariants } from "@/lib/motion";
import type { LeftSidebarShellConfig } from "@/lib/shells";
import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";
import { moveShellWidget, type ShellDropEdge } from "@/lib/shell-widget-order";
import { isLeftShellWidgetEnabled, shellEntranceTimeoutMs } from "@/lib/shell-runtime";
import { ShellCollectionsWidget } from "@/components/widgets/shell-widgets/ShellCollectionsWidget";
import { ShellControlsWidget } from "@/components/widgets/shell-widgets/ShellControlsWidget";
import { ShellCreateCollectionWidget } from "@/components/widgets/shell-widgets/ShellCreateCollectionWidget";
import { ShellFinishTraceWidget } from "@/components/widgets/shell-widgets/ShellFinishTraceWidget";
import { ShellModeSwitchWidget } from "@/components/widgets/shell-widgets/ShellModeSwitchWidget";
import { ShellRemoveTracePointWidget } from "@/components/widgets/shell-widgets/ShellRemoveTracePointWidget";
import { ShellResetViewWidget } from "@/components/widgets/shell-widgets/ShellResetViewWidget";
import { ShellSearchWidget } from "@/components/widgets/shell-widgets/ShellSearchWidget";
import { useShellCollectionsBinding } from "@/components/widgets/shell-widgets/collections/useShellCollectionsBinding";
import { ShellWidgetBoundary } from "@/components/shells/ShellWidgetBoundary";
import { ShellRuntimeProvider, useShellRuntimeActions, useShellRuntimeValue } from "@/components/shells/ShellRuntimeProvider";
import { type LayerVisibilityState } from "@/lib/layer-visibility";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";

interface SidebarProps {
  mode: InteractionMode;
  setMode: (val: InteractionMode) => void;
  selectedPoint?: { lng: number; lat: number } | null;
  drawingPath: { lng: number; lat: number }[];
  editingTraceId: string | null;
  editingAreaId: string | null;
  editingPinData: { id: string, name?: string, note?: string, image_url?: string } | null;
  traceDraftFinalized: boolean;
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
  refreshTrigger?: number;
  mobileSidebarOpen?: boolean;
  setMobileSidebarOpen?: (val: boolean) => void;
  desktopSidebarVisible?: boolean;
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
  selectedTraceNodeIndex?: number | null;
  onRemoveSelectedTraceNode?: () => void;
}

export default function Sidebar({ 
  mode, setMode, drawingPath, 
  traceDraftFinalized,
  curveMode, setCurveMode, terrain3D, setTerrain3D, isSatellite, setIsSatellite, onResetView,
  onClearSelection, onDataSaved,
  mobileSidebarOpen, setMobileSidebarOpen,
  desktopSidebarVisible = true, sidebarReady = false, shellConfig, shellId = "left_sidebar", shellWidgets = [], shellWidgetsLoaded = false, collectionsLoaded = false,
  onShellWidgetsReorder,
  collections, layerVisibility, setCollections, targetCollectionId, setTargetCollectionId
  , pendingPin, onCollectionConfirm, onToggleCollectionVisibility, onShowOnlyCollection, autoOpenCollectionId, onFinishTraceDraft, selectedTraceNodeIndex = null, onRemoveSelectedTraceNode
}: SidebarProps) {
  
  const awaitingLayerSelection =
    (mode === "pin" && !!pendingPin) ||
    (mode === "trace" && traceDraftFinalized);

  const shellInteractionLocked =
    Boolean(pendingPin) ||
    (((mode === "trace" || mode === "editTrace" || mode === "area" || mode === "editArea") &&
      drawingPath.length > 0) ||
      (mode === "trace" && traceDraftFinalized));

  const itemLabel =
    mode === "trace" || mode === "editTrace"
      ? "path"
      : mode === "area" || mode === "editArea"
        ? "zone"
        : "pin";

const shellSections = useMemo(
    () =>
      shellConfig?.sections ?? {
        search: true,
        modeSwitch: true,
        collections: true,
        controls: true,
        actions: true,
      },
    [shellConfig?.sections]
  );
  const desktopWidth = shellConfig?.width ?? 360;
  const orderedShellWidgets = useMemo(
    () => [...shellWidgets].sort((left, right) => left.position - right.position),
    [shellWidgets]
  );
  const [readyWidgetIds, setReadyWidgetIds] = useState<string[]>([]);
  const [shellEntranceTimedOut, setShellEntranceTimedOut] = useState(false);
  const [shellHasEntered, setShellHasEntered] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ widgetId: string; edge: ShellDropEdge } | null>(null);

  const visibleShellWidgets = useMemo(
    () => orderedShellWidgets.filter((widget) => isLeftShellWidgetEnabled(widget.componentKey, shellSections)),
    [orderedShellWidgets, shellSections]
  );

  const requiredShellWidgetIds = useMemo(
    () => visibleShellWidgets.map((widget) => widget.id),
    [visibleShellWidgets]
  );

  const allRequiredWidgetsReady = requiredShellWidgetIds.every((widgetId) =>
    readyWidgetIds.includes(widgetId)
  );

  const shellCanEnter =
    shellHasEntered ||
    (sidebarReady && shellWidgetsLoaded && (allRequiredWidgetsReady || shellEntranceTimedOut));
  useEffect(() => {
    setReadyWidgetIds((currentIds) =>
      currentIds.filter((widgetId) => requiredShellWidgetIds.includes(widgetId))
    );
  }, [requiredShellWidgetIds]);

  useEffect(() => {
    if (shellHasEntered || !sidebarReady || !shellWidgetsLoaded || requiredShellWidgetIds.length === 0 || allRequiredWidgetsReady) {
      setShellEntranceTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShellEntranceTimedOut(true);
    }, shellEntranceTimeoutMs);

    return () => window.clearTimeout(timeout);
  }, [allRequiredWidgetsReady, requiredShellWidgetIds.length, shellHasEntered, shellWidgetsLoaded, sidebarReady]);

  useEffect(() => {
    if (shellCanEnter && !shellHasEntered) {
      setShellHasEntered(true);
    }
  }, [shellCanEnter, shellHasEntered]);

  const handleWidgetLayoutReady = useCallback((widgetId: string) => {
    setReadyWidgetIds((currentIds) =>
      currentIds.includes(widgetId) ? currentIds : [...currentIds, widgetId]
    );
  }, []);

  const isWidgetLayoutReady = useCallback(
    (widget: Pick<WidgetInstanceRecord, "id" | "slug" | "componentKey">) => {
      if (!isLeftShellWidgetEnabled(widget.componentKey, shellSections)) {
        return false;
      }

      if (widget.componentKey === "shell_collections") {
        return collectionsLoaded;
      }

      return true;
    },
    [collectionsLoaded, shellSections]
  );

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

  const commitShellWidgetReorder = useCallback(
    (targetWidgetId: string, edge: ShellDropEdge) => {
      if (!draggedWidgetId || !onShellWidgetsReorder) {
        return;
      }

      const nextWidgets = moveShellWidget(orderedShellWidgets, draggedWidgetId, targetWidgetId, edge);

      if (nextWidgets === orderedShellWidgets) {
        return;
      }

      onShellWidgetsReorder(nextWidgets);
    },
    [draggedWidgetId, onShellWidgetsReorder, orderedShellWidgets]
  );

  const renderShellWidget = (widget: Pick<WidgetInstanceRecord, "id" | "slug" | "componentKey" | "config">) => {
    let content: React.ReactNode = null;
    let shouldRender = true;

    if (widget.componentKey === "shell_search") {
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
      shouldRender = mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized;

      if (shouldRender) {
        content = (
          <ShellFinishTraceWidget
            visible={true}
            onFinishTraceDraft={onFinishTraceDraft}
          />
        );
      }
    } else if (widget.componentKey === "shell_remove_trace_point") {
      shouldRender = mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized;

      if (shouldRender) {
        content = (
          <ShellRemoveTracePointWidget
            visible={true}
            selectedTraceNodeIndex={selectedTraceNodeIndex}
            onRemoveSelectedTraceNode={onRemoveSelectedTraceNode}
          />
        );
      }
    }

    if (!shouldRender || !content) {
      return null;
    }

    return (
      <ShellWidgetSlot
        key={widget.id}
        isDragging={draggedWidgetId === widget.id}
        isDropTarget={dropTarget?.widgetId === widget.id}
        dropEdge={dropTarget?.widgetId === widget.id ? dropTarget.edge : null}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", widget.id);
          setDraggedWidgetId(widget.id);
        }}
        onDragEnd={() => {
          setDraggedWidgetId(null);
          setDropTarget(null);
        }}
        onDragOver={(event) => {
          if (!draggedWidgetId || draggedWidgetId === widget.id) {
            return;
          }

          event.preventDefault();
          const targetRect = event.currentTarget.getBoundingClientRect();
          const edge: ShellDropEdge =
            event.clientY < targetRect.top + targetRect.height / 2 ? "before" : "after";

          if (dropTarget?.widgetId !== widget.id || dropTarget.edge !== edge) {
            setDropTarget({ widgetId: widget.id, edge });
          }
        }}
        onDrop={(event) => {
          event.preventDefault();

          const edge = dropTarget?.widgetId === widget.id ? dropTarget.edge : "after";
          commitShellWidgetReorder(widget.id, edge);
          setDraggedWidgetId(null);
          setDropTarget(null);
        }}
      >
        <ShellWidgetBoundary
          widgetId={widget.id}
          layoutReady={isWidgetLayoutReady(widget)}
          onLayoutReady={handleWidgetLayoutReady}
        >
          <WidgetErrorBoundary>{content}</WidgetErrorBoundary>
        </ShellWidgetBoundary>
      </ShellWidgetSlot>
    );
  };

  return (
    <>
      <div 
        className="absolute top-0 right-0 bottom-0 left-0 z-0 bg-[#ffffff]/0" 
        onClick={onClearSelection} 
      />

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close layers drawer"
          onClick={() => setMobileSidebarOpen?.(false)}
          className="fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px] md:hidden"
        />
      )}

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
      
      {/* MONDRIAN SPATIAL SIDEBAR (FLOATING WIDGETS) */}
        <ShellRuntimeProvider
        key={shellId}
        shellId={shellId}
        initialState={{
          collectionQuery: "",
          interactionMode: mode,
          areasDisabled: true,
          interactionLocked: shellInteractionLocked,
          highlightedCollectionId,
          editingCollectionId,
        }}
      >
        <ShellRuntimeModeSync mode={mode} />
        <ShellRuntimeInteractionLockSync interactionLocked={shellInteractionLocked} />
        <ShellRuntimeCollectionSelectionSync
          highlightedCollectionId={highlightedCollectionId}
          editingCollectionId={editingCollectionId}
        />
        <ShellRuntimeScrollContainer
          data-shell-scroll-container="true"
          className={`fixed inset-y-0 left-4 z-40 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-4 overflow-y-auto no-scrollbar pointer-events-none transform transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:left-6 md:w-[var(--sidebar-width)] ${
            mobileSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-[calc(100%+1.5rem)] opacity-0"
          } ${
            desktopSidebarVisible && shellCanEnter
              ? "md:translate-x-0 md:opacity-100"
              : "md:translate-x-0 md:opacity-0"
          }`}
          variants={sidebarShellVariants}
          initial="hidden"
          animate={desktopSidebarVisible && shellCanEnter ? "visible" : "hidden"}
          style={
            {
              pointerEvents: desktopSidebarVisible || mobileSidebarOpen ? undefined : "none",
              "--sidebar-width": `${desktopWidth}px`,
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            } as CSSProperties
          }
        >
          <div className="flex flex-col gap-4 min-h-max pb-6 pr-2 md:pr-3">
            <div className="flex flex-col gap-4 pointer-events-auto">
              <div
                aria-hidden="true"
                className="h-24 shrink-0 md:h-28"
              />
              {orderedShellWidgets.map((widget) => renderShellWidget(widget))}
              <div
                aria-hidden="true"
                className="h-24 shrink-0 md:h-28"
              />
            </div>
          </div>
        </ShellRuntimeScrollContainer>
      </ShellRuntimeProvider>
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

const ShellRuntimeScrollContainer = (props: HTMLMotionProps<"div">) => {
  const { registerScrollContainer } = useShellRuntimeActions();

  const handleContainerRef = useCallback((element: HTMLDivElement | null) => {
    registerScrollContainer(element);
  }, [registerScrollContainer]);

  return (
    <motion.div
      {...props}
      ref={handleContainerRef}
    />
  );
}
