"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { BaseShell } from "@synarava/shell-kit";
import { SHELL_GLASS } from "@/modules/shell/constants";
import { SHELL_PANEL_STYLE, SHELL_PANEL_WIDTH } from "@/modules/shell/constants";
import { MapModeProvider } from "@/modules/map/MapModeContext";
import { MapControlsProvider } from "@/contexts/map-controls-context";
import { CollectionsProvider } from "@/modules/collections/CollectionsContext";
import { LeftSidebarShell } from "@/modules/shell/LeftSidebarShell";
import { MapErrorBoundary } from "@/components/errors/MapErrorBoundary";
import { ShellErrorBoundary } from "@/components/errors/ShellErrorBoundary";
import { DestructiveActionDialog } from "@synarava/ui-kit";
import { UserAvatarBadge } from "@synarava/ui-kit";
import { useViewport } from "@/contexts/viewport-context";
import { useShellBootstrap } from "@/modules/shell/ShellBootstrapContext";
import { useGeometryEditor } from "@/modules/map/hooks/useGeometryEditor";
import { useCollectionManager } from "@/modules/collections/hooks/useCollectionManager";
import { shouldAutoOpenLayerDrawer } from "@/modules/collections/layer-logic";
import {
  DEFAULT_MAP_STYLE_ID,
  MAP_STYLE_STORAGE_KEY,
  isMapStyleId,
  type MapStyleId,
} from "@/modules/map/config";
import { addWidgetFromLibrary } from "@/app/actions";

const MapCanvas = dynamic(() => import("@/modules/map").then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,215,235,0.9),rgba(246,242,232,0.92)_38%,rgba(241,236,224,0.98)_100%)]" />
  ),
});
const WidgetOverlay = dynamic(() => import("@/components/panels/WidgetOverlay").then((m) => m.WidgetOverlay), { ssr: false });
const WidgetPanel = dynamic(() => import("@/components/panels/WidgetPanel").then((m) => m.WidgetPanel), { ssr: false });
const UserShellPanel = dynamic(() => import("@/components/panels/UserShellPanel").then((m) => m.UserShellPanel), { ssr: false });

const E2E_SHELL_PIN_ID = "11111111-1111-4111-8111-111111111111";
const IS_E2E_TEST_MODE = process.env.NEXT_PUBLIC_E2E_TEST_MODE === "1";

export function AppLayout() {
  const viewport = useViewport();
  const { isMobileViewport, mobileSidebarOpen, desktopSidebarVisible, setMobileSidebarOpen, toggleDesktopSidebar } = viewport;
  const { shellId, leftSidebarWidgets, setLeftSidebarWidgets, userProfile, setUserProfile } = useShellBootstrap();

  const collMgr = useCollectionManager();
  const geo = useGeometryEditor({
    collections: collMgr.collections,
    isMobileViewport,
    setMobileSidebarOpen,
    targetCollectionId: collMgr.targetCollectionId,
    setTargetCollectionId: collMgr.setTargetCollectionId,
    triggerRefresh: collMgr.triggerRefresh,
    registerCollection: collMgr.registerCollection,
    unregisterCollection: collMgr.unregisterCollection,
    revealCollection: collMgr.revealCollection,
    layerVisibility: collMgr.layerVisibility,
  });

  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = useState(false);
  const [isUserShellOpen, setIsUserShellOpen] = useState(false);
  const [shouldMountMap, setShouldMountMap] = useState(false);
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>(DEFAULT_MAP_STYLE_ID);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
  const [curveMode, setCurveMode] = useState(false);
  const [terrain3D, setTerrain3D] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(MAP_STYLE_STORAGE_KEY);
    if (isMapStyleId(stored)) setMapStyleId(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const win = window as Window & { requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number; cancelIdleCallback?: (h: number) => void };
    const mount = () => { if (!cancelled) setShouldMountMap(true); };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => mount(), { timeout: 900 });
      return () => { cancelled = true; win.cancelIdleCallback?.(id); };
    }
    const id = window.setTimeout(mount, 180);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const win = window as Window & { requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number; cancelIdleCallback?: (h: number) => void };
    const preload = () => {
      if (cancelled) return;
      void import("@/components/panels/WidgetOverlay");
      void import("@/components/panels/WidgetPanel");
      void import("@/components/panels/UserShellPanel");
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => preload(), { timeout: 1500 });
      return () => { cancelled = true; win.cancelIdleCallback?.(id); };
    }
    const id = window.setTimeout(preload, 300);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, []);

  const isAnyRightPanelOpen =
    isWidgetPanelOpen ||
    isUserShellOpen ||
    (geo.mode === "editPin" && !!geo.editingPinData) ||
    (geo.mode === "editTrace" && !!geo.editingTraceId) ||
    (geo.mode === "editArea" && !!geo.editingAreaId);

  const effectiveMobileSidebarOpen = mobileSidebarOpen && !(isMobileViewport && isAnyRightPanelOpen);

  useEffect(() => {
    if (isMobileViewport && isAnyRightPanelOpen) setMobileSidebarOpen(false);
  }, [isAnyRightPanelOpen, isMobileViewport, setMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileViewport) return;
    if (shouldAutoOpenLayerDrawer(isMobileViewport, geo.mode, !!geo.pendingPin, geo.traceDraftFinalized, geo.areaDraftFinalized)) {
      setMobileSidebarOpen(true);
    }
  }, [geo.areaDraftFinalized, geo.mode, geo.pendingPin, geo.traceDraftFinalized, isMobileViewport, setMobileSidebarOpen]);

  const handleMapStyleChange = (value: MapStyleId) => {
    setMapStyleId(value);
    window.localStorage.setItem(MAP_STYLE_STORAGE_KEY, value);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-gray-100 text-gray-900 font-sans">
      <div
        className={`fixed top-0 left-0 bottom-0 z-30 hidden md:block ${desktopSidebarVisible ? "" : "pointer-events-none opacity-0"}`}
        style={{ width: `${SHELL_PANEL_WIDTH + 24}px` }}
      />

      {/* Chrome header shell */}
      <BaseShell
        isOpen onClose={() => undefined} title="Visit All" closeLabel=""
        showBackdrop={false} showHeader={false} mobileHandle={false}
        {...SHELL_GLASS}
        shellClassName="fixed left-3 top-3 z-50 flex w-[calc(100vw-1.5rem)] md:w-[var(--shell-panel-width)] pointer-events-none"
        shellStyle={SHELL_PANEL_STYLE}
        surfaceClassName="relative isolate w-full pointer-events-auto overflow-visible rounded-[24px] [contain:paint]"
        contentContainerClassName="flex flex-col overflow-visible"
        bodyClassName="flex flex-col" scrollBodyClassName=""
        scrollContentClassName="px-4 py-3" childrenClassName="pointer-events-auto"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Synarava</p>
            <h2 className="mt-0.5 text-base font-black tracking-tight text-neutral-950">Visit All</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/messenger"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-neutral-600 transition-colors hover:bg-white hover:text-[#2f6bff]"
              title="Открыть чат"
            >
              <MessageSquare className="w-4.5 h-4.5" />
            </Link>
            <button
              type="button"
              onClick={isMobileViewport ? () => setMobileSidebarOpen(!mobileSidebarOpen) : toggleDesktopSidebar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-neutral-600 transition-colors hover:bg-white"
              aria-label={desktopSidebarVisible ? "Close shell" : "Open shell"}
            >
              <span className="text-lg leading-none">{desktopSidebarVisible ? "‹" : "≡"}</span>
            </button>
          </div>
        </div>
      </BaseShell>

      {/* Left shell with all data providers */}
      <MapModeProvider
        mode={geo.mode} setMode={geo.setMode}
        drawingPath={geo.drawingPath}
        traceRoutingMode={geo.traceRoutingMode}
        setTraceRoutingMode={geo.setTraceRoutingMode}
        traceRoutingPending={geo.traceRoutingPending}
        traceRoutingError={geo.traceRoutingError}
        traceDraftFinalized={geo.traceDraftFinalized}
        areaDraftFinalized={geo.areaDraftFinalized}
        selectedTraceNodeIndex={geo.selectedTraceNodeIndex}
        pendingPin={geo.pendingPin}
        editingTraceId={geo.editingTraceId}
        editingAreaId={geo.editingAreaId}
        onFinishTraceDraft={geo.handleFinishTraceDraft}
        onFinishAreaDraft={geo.handleFinishAreaDraft}
        onRemoveSelectedTraceNode={geo.handleRemoveSelectedTraceNode}
        onUndoDraft={() => { void geo.handleUndo(); }}
        onCancelDraft={geo.handleCancel}
        onClearSelection={() => geo.setSelectedPoint(null)}
      >
        <MapControlsProvider
          mapStyleId={mapStyleId} setMapStyleId={handleMapStyleChange}
          terrain3D={terrain3D} setTerrain3D={setTerrain3D}
          curveMode={curveMode} setCurveMode={setCurveMode}
          onResetView={() => setResetViewTrigger((v) => v + 1)}
          disabled={
            !!geo.pendingPin ||
            ((geo.mode === "trace" || geo.mode === "editTrace" || geo.mode === "area" || geo.mode === "editArea") && geo.drawingPath.length > 0) ||
            (geo.mode === "trace" && geo.traceDraftFinalized) ||
            (geo.mode === "area" && geo.areaDraftFinalized)
          }
        >
          <CollectionsProvider
            collections={collMgr.collections}
            setCollections={collMgr.setCollections}
            collectionsLoaded={false}
            targetCollectionId={collMgr.targetCollectionId}
            setTargetCollectionId={collMgr.setTargetCollectionId}
            mode={geo.mode}
            pendingPin={geo.pendingPin}
            traceDraftFinalized={geo.traceDraftFinalized}
            areaDraftFinalized={geo.areaDraftFinalized}
            autoOpenCollectionId={geo.autoOpenCollectionId}
            onCollectionConfirm={geo.confirmCollectionSelection}
            onDataSaved={geo.handleDataSaved}
            setMobileSidebarOpen={setMobileSidebarOpen}
            layerVisibility={collMgr.layerVisibility}
            onToggleCollectionVisibility={collMgr.toggleCollectionVisibility}
            onShowOnlyCollection={collMgr.showOnlyCollection}
          >
            <LeftSidebarShell
              shellId={shellId}
              isOpen={isMobileViewport ? effectiveMobileSidebarOpen : desktopSidebarVisible}
              onClose={isMobileViewport ? () => setMobileSidebarOpen(false) : toggleDesktopSidebar}
              widgets={leftSidebarWidgets}
              onWidgetsReorder={setLeftSidebarWidgets}
            />
          </CollectionsProvider>
        </MapControlsProvider>
      </MapModeProvider>

      {/* Map canvas */}
      <MapErrorBoundary>
        {shouldMountMap ? (
          <MapCanvas
            mode={geo.mode}
            onMapClick={geo.handleMapClick}
            onTraceSelected={geo.handleTraceSelected}
            onTraceAnchorClick={geo.handleTraceAnchorMergeRequest}
            onTraceLineClick={geo.handleTraceLineMergeRequest}
            onAreaSelected={geo.handleAreaSelected}
            onPinSelected={geo.handlePinSelected}
            onPendingPinCancel={geo.handlePendingPinCancel}
            onTraceNodeClick={geo.handleTraceNodeClick}
            selectedTraceNodeIndex={geo.selectedTraceNodeIndex}
            selectedPoint={geo.selectedPoint}
            drawingPath={geo.drawingPath}
            traceControlPoints={geo.traceRoutingMode === "pedestrian" ? geo.traceAnchors : geo.drawingPath}
            traceRoutingMode={geo.traceRoutingMode}
            traceRoutingPending={geo.traceRoutingPending}
            onTraceControlPointChange={geo.handleTraceAnchorChange}
            setDrawingPath={geo.setDrawingPath}
            editingTraceId={geo.editingTraceId}
            editingAreaId={geo.editingAreaId}
            traceDraftFinalized={geo.traceDraftFinalized}
            areaDraftFinalized={geo.areaDraftFinalized}
            curveMode={curveMode}
            terrain3D={terrain3D}
            mapStyleId={mapStyleId}
            resetViewTrigger={resetViewTrigger}
            refreshTrigger={geo.mapRefreshTick}
            hiddenCollectionIds={collMgr.invisibleCollectionIds}
            collectionStyles={collMgr.liveCollectionStyles}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,215,235,0.9),rgba(246,242,232,0.92)_38%,rgba(241,236,224,0.98)_100%)]" />
        )}
      </MapErrorBoundary>

      {/* Right panel backdrop */}
      {((geo.mode === "editPin" && !!geo.editingPinData) ||
        (geo.mode === "editTrace" && !!geo.editingTraceId) ||
        (geo.mode === "editArea" && !!geo.editingAreaId)) && (
        <div className="fixed top-0 right-0 bottom-0 z-45 hidden w-[520px] md:block" />
      )}

      {/* Right entity/geometry panels */}
      {geo.mode === "editPin" && !!geo.editingPinData ? (
        <ShellErrorBoundary title="Right Entity Shell Fault">
          <WidgetOverlay
            isOpen onClose={() => { geo.setEditingPinData(null); geo.setMode("pin"); }}
            onDataSaved={geo.handleDataSaved}
            refreshTrigger={collMgr.dbRefreshTrigger}
            onDeletePin={geo.handleDeleteSavedPin}
            onOpenNearbyPin={geo.handleOpenNearbyPin}
            entityType="pin" entityId={geo.editingPinData.id}
            data={{ id: geo.editingPinData.id, title: geo.editingPinData.name || "Untitled Marker", description: geo.editingPinData.note || "", imageUrl: geo.editingPinData.image_url, collectionId: geo.editingPinData.collectionId, tags: ["Curated Map", "Location"] }}
          />
        </ShellErrorBoundary>
      ) : geo.mode === "editTrace" && !!geo.editingTraceId ? (
        <ShellErrorBoundary title="Right Trace Shell Fault">
          <WidgetOverlay
            isOpen
            onClose={() => { geo.setEditingTraceId(null); geo.setEditingTraceData(null); geo.setEditingTraceCollectionId(null); geo.setDrawingPath([]); geo.setSelectedPoint(null); geo.setMode("trace"); collMgr.triggerRefresh(); }}
            refreshTrigger={collMgr.dbRefreshTrigger} entityType="trace" entityId={geo.editingTraceId}
            data={geo.editingTraceData ? { id: geo.editingTraceData.id, title: geo.editingTraceData.name || "Untitled Path", collectionId: geo.editingTraceData.collectionId, tags: ["Curated Map", "Path"] } : undefined}
          />
        </ShellErrorBoundary>
      ) : geo.mode === "editArea" && !!geo.editingAreaId ? (
        <ShellErrorBoundary title="Right Area Shell Fault">
          <WidgetOverlay
            isOpen
            onClose={() => { geo.setEditingAreaId(null); geo.setEditingAreaData(null); geo.setEditingAreaCollectionId(null); geo.setDrawingPath([]); geo.setSelectedPoint(null); geo.setMode("area"); collMgr.triggerRefresh(); }}
            refreshTrigger={collMgr.dbRefreshTrigger} entityType="area" entityId={geo.editingAreaId}
            data={geo.editingAreaData ? { id: geo.editingAreaData.id, title: geo.editingAreaData.name || "Untitled Zone", collectionId: geo.editingAreaData.collectionId, tags: ["Curated Map", "Zone"] } : undefined}
          />
        </ShellErrorBoundary>
      ) : null}

      <ShellErrorBoundary title="Widget Center Shell Fault">
        <WidgetPanel
          isOpen={isWidgetPanelOpen} onClose={() => setIsWidgetPanelOpen(false)}
          onLibraryMutation={collMgr.triggerRefresh}
          entityType={geo.mode === "editPin" ? "pin" : geo.mode === "editTrace" ? "trace" : geo.mode === "editArea" ? "area" : undefined}
          entityId={geo.mode === "editPin" ? geo.editingPinData?.id : geo.mode === "editTrace" ? geo.editingTraceId ?? undefined : geo.mode === "editArea" ? geo.editingAreaId ?? undefined : undefined}
        />
      </ShellErrorBoundary>

      {isUserShellOpen && (
        <ShellErrorBoundary title="User Shell Fault">
          <UserShellPanel isOpen onClose={() => setIsUserShellOpen(false)} onProfileChange={setUserProfile} />
        </ShellErrorBoundary>
      )}

      <DestructiveActionDialog
        open={Boolean(geo.pendingTraceMerge)}
        saving={geo.mergeTraceSaving}
        eyebrow="Merge Paths"
        title={geo.pendingTraceMerge ? `Merge With ${geo.pendingTraceMerge.traceTitle}` : "Merge Paths"}
        description={geo.pendingTraceMerge ? (geo.pendingTraceMerge.kind === "branch" ? "Attach this branch to the selected point on the path? It will remain one path with multiple endpoints." : "Do you want to merge the current draft with this existing path? If you confirm, the route will be saved immediately in the background as one continuous path.") : ""}
        confirmLabel={geo.pendingTraceMerge?.kind === "branch" ? "Attach Branch" : "Merge Paths"} pendingLabel="Saving..." cancelLabel="Cancel"
        confirmButtonClassName="h-16 border-l border-black/10 bg-[#111111] text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#0f7a3d] disabled:cursor-not-allowed disabled:opacity-65"
        onCancel={geo.cancelPendingTraceMerge}
        onConfirm={() => { void geo.finalizeMergedTraceSave(); }}
      />

      {IS_E2E_TEST_MODE && (
        <button
          type="button" data-testid="e2e-open-shell-pin"
          onClick={async () => {
            await addWidgetFromLibrary("entity_rating", "pin", E2E_SHELL_PIN_ID).catch(() => null);
            geo.setEditingTraceId(null); geo.setEditingAreaId(null);
            geo.setEditingPinData({ id: E2E_SHELL_PIN_ID, name: "E2E Shell Pin", note: "Playwright shell contract pin" });
            geo.setMode("editPin");
          }}
          className="fixed bottom-2 left-2 z-120 h-2 w-2 opacity-0" aria-hidden="true"
        />
      )}

      {/* Floating corner widgets */}
      <div className="fixed top-6 right-6 z-40 flex gap-4 pointer-events-none">
        <button
          onClick={() => { geo.setEditingPinData(null); setMobileSidebarOpen(false); geo.setMode("pin"); setIsWidgetPanelOpen((v) => !v); }}
          className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center shadow-sm px-4 py-2 pointer-events-auto hover:bg-white/40 transition-colors cursor-pointer gap-2 fixed right-4 top-4 md:static md:right-auto md:top-auto"
        >
          <div className="grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-[1px] bg-black/40" />
            ))}
          </div>
          <span className="font-bold text-xs">Widgets</span>
          <span className="text-[10px]">✨</span>
        </button>

        <Link
          href="/messenger"
          className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center shadow-sm px-4 py-2 pointer-events-auto hover:bg-white/40 transition-colors cursor-pointer gap-2"
        >
          <MessageSquare className="w-4 h-4 text-black/75" />
          <span className="font-bold text-xs">Chat</span>
        </Link>

        <button
          type="button" onClick={() => setIsUserShellOpen((v) => !v)} data-testid="open-user-shell"
          className="hidden bg-white/20 backdrop-blur-xl border border-white/20 rounded-full md:flex items-center shadow-sm p-1 pr-4 pointer-events-auto hover:bg-white/40 transition-colors cursor-pointer gap-3"
        >
          <UserAvatarBadge styleId={userProfile?.avatarStyle} size="sm" />
          <div className="flex flex-col justify-center text-left">
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">{userProfile?.displayName || "Curator"}</span>
            <span className="text-[8px] text-black/50 uppercase tracking-widest leading-none mt-0.5">{userProfile?.emailVerifiedAt ? "Verified" : "Pending"}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
