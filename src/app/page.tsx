"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import MapCanvas from "@/components/map/MapCanvas";
import Sidebar from "@/components/ui/Sidebar";
import { WidgetProvider } from "@/components/widgets/WidgetContext";
import { WidgetOverlay } from "@/components/glass/WidgetOverlay";
import { WidgetPanel } from "@/components/glass/WidgetPanel";
import { getCollections, savePin, saveTrace, updateTrace, deleteTrace, saveArea, updateArea, deleteArea, createCollection, deleteCollection, deletePin } from "@/app/actions";
import type { FeatureProperties } from "@/components/widgets/WidgetContext";
import { Layers3 } from "lucide-react";
import {
  modeToCollectionType,
  moveCollectionToTop,
  shouldAutoOpenLayerDrawer,
} from "@/lib/layer-logic";
import {
  createLayerVisibilityState,
  getInvisibleCollectionIdsFromState,
  isLayerVisible,
  layerVisibilityReducer,
} from "@/lib/layer-visibility";
import { removePathPoint } from "@/lib/path-editing";

export interface Collection {
  id: string;
  name: string;
  color: string;
  icon: string;
  itemCount: number;
}

export type InteractionMode = 'pin' | 'trace' | 'area' | 'editTrace' | 'editArea' | 'editPin';

export default function HomePage() {
  const [mode, setMode] = useState<InteractionMode>('pin');
  
  const [selectedPoint, setSelectedPoint] = useState<{lng: number, lat: number} | null>(null);
  const [drawingPath, setDrawingPath] = useState<{lng: number, lat: number}[]>([]);
  const [traceDraftFinalized, setTraceDraftFinalized] = useState(false);
  
  const [editingTraceId, setEditingTraceId] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [selectedTraceNodeIndex, setSelectedTraceNodeIndex] = useState<number | null>(null);
  const [editingTraceCollectionId, setEditingTraceCollectionId] = useState<string | null>(null);
  const [editingAreaCollectionId, setEditingAreaCollectionId] = useState<string | null>(null);
  const [editingPinData, setEditingPinData] = useState<{ id: string, name?: string, note?: string, image_url?: string, collectionId?: string } | null>(null);
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = useState(false);
  
  const [curveMode, setCurveMode] = useState(false);
  const [terrain3D, setTerrain3D] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState(0);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>("");
  const [pendingPin, setPendingPin] = useState<{ lng: number; lat: number } | null>(null);
  const [layerVisibility, dispatchLayerVisibility] = useReducer(
    layerVisibilityReducer,
    undefined,
    () => createLayerVisibilityState()
  );
  const [autoCreatedCollectionId, setAutoCreatedCollectionId] = useState<string | null>(null);
  const [autoOpenCollectionId, setAutoOpenCollectionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const collType = modeToCollectionType(mode);
        const data = await getCollections(collType);
        const orderedCollections = activeCollectionId ? moveCollectionToTop(data, activeCollectionId) : data;
        setCollections(orderedCollections);
        if (orderedCollections.length > 0) {
          // Keep current active if it exists in the new list, otherwise pick first
          const exists = orderedCollections.find((c: Collection) => c.id === activeCollectionId);
          if (!exists) setActiveCollectionId(orderedCollections[0].id);
        } else {
          setActiveCollectionId("");
        }
      } catch (err) { console.error("Failed to load collections", err); } 
    }
    fetchCollections();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbRefreshTrigger, mode]);

  useEffect(() => {
    async function fetchAllCollections() {
      try {
        const data = await getCollections();
        setAllCollections(data);
        dispatchLayerVisibility({
          type: "sync",
          collectionIds: data.map((collection) => collection.id),
        });
      } catch (err) {
        console.error("Failed to load all collections", err);
      }
    }

    fetchAllCollections();
  }, [dbRefreshTrigger]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewportState = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? mediaQuery.matches;
      setIsMobileViewport(matches);
      if (!matches) {
        setMobileSidebarOpen(false);
      }
    };

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportState);
    };
  }, []);

  const getActiveColor = () => collections.find(c => c.id === activeCollectionId)?.color || "#0000ff";

  const confirmCollectionSelection = async (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setCollections((currentCollections) => moveCollectionToTop(currentCollections, collectionId));
    dispatchLayerVisibility({ type: "reveal", collectionId });

    try {
      if (pendingPin) {
        await savePin(pendingPin.lng, pendingPin.lat, collectionId, "Untitled Marker");
        setPendingPin(null);
        setSelectedPoint(null);
        setAutoOpenCollectionId(null);
        if (isMobileViewport) {
          setMobileSidebarOpen(false);
        }
        setDbRefreshTrigger((value) => value + 1);
        return;
      }

      if (mode === "trace" && traceDraftFinalized && drawingPath.length >= 2) {
        const selectedCollectionColor = collections.find((collection) => collection.id === collectionId)?.color || "#0000ff";
        await saveTrace(drawingPath.map((point) => [point.lng, point.lat]), selectedCollectionColor, collectionId);
        setDrawingPath([]);
        setTraceDraftFinalized(false);
        setAutoOpenCollectionId(null);
        if (isMobileViewport) {
          setMobileSidebarOpen(false);
        }
        setDbRefreshTrigger((value) => value + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCollectionVisibility = (collectionId: string) => {
    dispatchLayerVisibility({ type: "toggle-mute", collectionId });
  };

  const showOnlyCollection = (collectionId: string) => {
    dispatchLayerVisibility({ type: "toggle-solo", collectionId });
  };

  const invisibleCollectionIds = getInvisibleCollectionIdsFromState(allCollections, layerVisibility);

  const handleMapClick = async (lng: number, lat: number) => {
    if (isMobileViewport) {
      setMobileSidebarOpen(false);
    }

    if (mode === 'pin') {
      setPendingPin({ lng, lat });
      setSelectedPoint({ lng, lat });
      if (collections.length === 0 && !autoCreatedCollectionId) {
        try {
          const newCollection = await createCollection("undefined", "#0000ff", "!", "pin");
          setCollections([newCollection]);
          setActiveCollectionId(newCollection.id);
          setAutoCreatedCollectionId(newCollection.id);
          setAutoOpenCollectionId(newCollection.id);
        } catch (error) {
          console.error(error);
        }
      }
    } else if (mode === 'trace') {
      if (traceDraftFinalized) return;
      const newPath = [...drawingPath, { lng, lat }];
      setDrawingPath(newPath);
    } else if (mode === 'editTrace') {
      const newPath = [...drawingPath, { lng, lat }];
      setDrawingPath(newPath);
      if (editingTraceId) {
        await updateTrace(editingTraceId, newPath.map(p => [p.lng, p.lat]));
        setDbRefreshTrigger(p => p + 1);
      }
    } else if (mode === 'area') {
      if (!activeCollectionId) return;
      const newPath = [...drawingPath, { lng, lat }];
      setDrawingPath(newPath);
      if (newPath.length === 3) {
        try {
          const res = await saveArea(newPath.map(p => [p.lng, p.lat]), getActiveColor(), activeCollectionId);
          setEditingAreaId(res.id);
          setMode('editArea');
          setDbRefreshTrigger(p => p + 1);
        } catch (e) { console.error(e); }
      }
    } else if (mode === 'editArea') {
      const newPath = [...drawingPath, { lng, lat }];
      setDrawingPath(newPath);
      if (editingAreaId) {
        await updateArea(editingAreaId, newPath.map(p => [p.lng, p.lat]));
        setDbRefreshTrigger(p => p + 1);
      }
    }
  };

  const handlePendingPinCancel = async () => {
    setPendingPin(null);
    setSelectedPoint(null);
    setAutoOpenCollectionId(null);

    if (autoCreatedCollectionId) {
      try {
        await deleteCollection(autoCreatedCollectionId);
        setCollections([]);
        setActiveCollectionId("");
        setAutoCreatedCollectionId(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleTraceSelected = (id: string, coordinates: {lng: number, lat: number}[], properties?: FeatureProperties) => {
    setMobileSidebarOpen(false);
    setMode('editTrace');
    setEditingTraceId(id);
    setEditingTraceCollectionId((properties?.collection_id as string | undefined) || null);
    setSelectedTraceNodeIndex(null);
    setDrawingPath(coordinates);
    setTraceDraftFinalized(false);
    setSelectedPoint(null);
  };

  const handleAreaSelected = (id: string, coordinates: {lng: number, lat: number}[], properties?: FeatureProperties) => {
    setMobileSidebarOpen(false);
    setMode('editArea');
    setEditingAreaId(id);
    setEditingAreaCollectionId((properties?.collection_id as string | undefined) || null);
    setSelectedTraceNodeIndex(null);
    setDrawingPath(coordinates);
    setSelectedPoint(null);
  };

  const handlePinSelected = (id: string, properties: FeatureProperties) => {
    setIsWidgetPanelOpen(false);
    setMobileSidebarOpen(false);
    setMode('editPin');
    setEditingPinData({ id, note: properties.note, image_url: properties.image_url, name: properties.name, collectionId: properties.collection_id });
    setSelectedPoint(null);
  };

  const handleDeleteSavedPin = async (pinId: string) => {
    try {
      await deletePin(pinId);

      setEditingPinData(null);
      setMode("pin");
      setDbRefreshTrigger((value) => value + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDataSaved = () => {
    setSelectedPoint(null);
    setDrawingPath([]);
    setEditingTraceId(null);
    setEditingAreaId(null);
    setSelectedTraceNodeIndex(null);
    setEditingTraceCollectionId(null);
    setEditingAreaCollectionId(null);
    setEditingPinData(null);
    setPendingPin(null);
    setAutoOpenCollectionId(null);
    setTraceDraftFinalized(false);
    setMobileSidebarOpen(false);
    if (mode === 'editTrace') setMode('trace');
    if (mode === 'editArea') setMode('area');
    if (mode === 'editPin') setMode('pin');
    setDbRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    const shouldDeleteAutoCollection =
      !!autoCreatedCollectionId &&
      ((mode === "pin" && !!pendingPin) || (mode === "trace" && traceDraftFinalized));

    setSelectedPoint(null);
    setDrawingPath([]);
    setEditingTraceId(null);
    setEditingAreaId(null);
    setSelectedTraceNodeIndex(null);
    setEditingTraceCollectionId(null);
    setEditingAreaCollectionId(null);
    setEditingPinData(null);
    setPendingPin(null);
    setAutoOpenCollectionId(null);
    setTraceDraftFinalized(false);
    if (mode === 'editTrace') setMode('trace');
    if (mode === 'editArea') setMode('area');
    if (mode === 'editPin') setMode('pin');

    if (shouldDeleteAutoCollection) {
      void (async () => {
        try {
          await deleteCollection(autoCreatedCollectionId);
          setCollections([]);
          setActiveCollectionId("");
          setAutoCreatedCollectionId(null);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  };

  const handleUndo = useCallback(async () => {
    if (drawingPath.length === 0) return;

    if (mode === 'trace') {
      if (traceDraftFinalized) {
        setTraceDraftFinalized(false);
        return;
      }
      setDrawingPath((currentPath) => currentPath.slice(0, -1));
      setSelectedTraceNodeIndex((currentIndex) => {
        if (currentIndex === null) return null;
        return currentIndex >= drawingPath.length - 1 ? Math.max(drawingPath.length - 2, 0) : currentIndex;
      });
      return;
    }

    const newPath = drawingPath.slice(0, -1);
    setDrawingPath(newPath);
    setSelectedTraceNodeIndex((currentIndex) => {
      if (currentIndex === null) return null;
      if (newPath.length === 0) return null;
      return currentIndex >= newPath.length ? newPath.length - 1 : currentIndex;
    });
    
    if (mode === 'editTrace' && editingTraceId) {
      if (newPath.length < 2) {
          await deleteTrace(editingTraceId);
          setEditingTraceId(null);
          setMode('trace');
      } else {
          await updateTrace(editingTraceId, newPath.map(p => [p.lng, p.lat]));
      }
      setDbRefreshTrigger(p => p+1);
    } else if (mode === 'editArea' && editingAreaId) {
      if (newPath.length < 3) {
          await deleteArea(editingAreaId);
          setEditingAreaId(null);
          setMode('area');
      } else {
          await updateArea(editingAreaId, newPath.map(p => [p.lng, p.lat]));
      }
      setDbRefreshTrigger(p => p+1);
    }
  }, [drawingPath, mode, traceDraftFinalized, editingTraceId, editingAreaId]);

  useEffect(() => {
    if (mode !== 'pin' && pendingPin) {
      setPendingPin(null);
      setSelectedPoint(null);
    }
  }, [mode, pendingPin]);

  useEffect(() => {
    if (!editingPinData?.collectionId) {
      return;
    }

    if (!isLayerVisible(layerVisibility, editingPinData.collectionId)) {
      setEditingPinData(null);
      if (mode === "editPin") {
        setMode("pin");
      }
    }
  }, [editingPinData, layerVisibility, mode]);

  useEffect(() => {
    if (!editingTraceId || !editingTraceCollectionId) {
      return;
    }

    if (!isLayerVisible(layerVisibility, editingTraceCollectionId)) {
      setEditingTraceId(null);
      setEditingTraceCollectionId(null);
      setDrawingPath([]);
      if (mode === "editTrace") {
        setMode("trace");
      }
    }
  }, [editingTraceCollectionId, editingTraceId, layerVisibility, mode]);

  useEffect(() => {
    if (!editingAreaId || !editingAreaCollectionId) {
      return;
    }

    if (!isLayerVisible(layerVisibility, editingAreaCollectionId)) {
      setEditingAreaId(null);
      setEditingAreaCollectionId(null);
      setDrawingPath([]);
      if (mode === "editArea") {
        setMode("area");
      }
    }
  }, [editingAreaCollectionId, editingAreaId, layerVisibility, mode]);

  useEffect(() => {
    if (mode !== "trace" && traceDraftFinalized) {
      setTraceDraftFinalized(false);
    }
  }, [mode, traceDraftFinalized]);

  useEffect(() => {
    if (selectedTraceNodeIndex === null) {
      return;
    }

    if (selectedTraceNodeIndex >= drawingPath.length) {
      setSelectedTraceNodeIndex(drawingPath.length > 0 ? drawingPath.length - 1 : null);
    }
  }, [drawingPath.length, selectedTraceNodeIndex]);

  useEffect(() => {
    if (!isMobileViewport) {
      return;
    }

    if (shouldAutoOpenLayerDrawer(isMobileViewport, mode, !!pendingPin, traceDraftFinalized)) {
      setMobileSidebarOpen(true);
    }
  }, [isMobileViewport, mode, pendingPin, traceDraftFinalized]);

  const handleFinishTraceDraft = () => {
    if (drawingPath.length < 2) return;
    setSelectedTraceNodeIndex(null);
    setTraceDraftFinalized(true);

    if (collections.length === 0 && !autoCreatedCollectionId) {
      void (async () => {
        try {
          const newCollection = await createCollection("undefined", "#0000ff", "!", "trace");
          setCollections([newCollection]);
          setActiveCollectionId(newCollection.id);
          setAutoCreatedCollectionId(newCollection.id);
          setAutoOpenCollectionId(newCollection.id);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  };

  const handleTraceNodeClick = (nodeIndex: number) => {
    if (!mode.includes("trace") || traceDraftFinalized) {
      return;
    }

    setSelectedTraceNodeIndex((currentIndex) => (currentIndex === nodeIndex ? null : nodeIndex));
  };

  const handleRemoveSelectedTraceNode = async () => {
    if (selectedTraceNodeIndex === null) {
      return;
    }

    const nextPath = removePathPoint(drawingPath, selectedTraceNodeIndex);
    setSelectedTraceNodeIndex(null);

    if (mode === "trace") {
      if (nextPath.length === 0) {
        handleCancel();
        return;
      }

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
        await updateTrace(editingTraceId, nextPath.map((point) => [point.lng, point.lat]));
      }

      setDbRefreshTrigger((value) => value + 1);
    }
  };

  useEffect(() => {
    if (autoCreatedCollectionId && !collections.some((collection) => collection.id === autoCreatedCollectionId)) {
      setAutoCreatedCollectionId(null);
    }
  }, [autoCreatedCollectionId, collections]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  return (
    <WidgetProvider>
      <div className="w-screen h-screen overflow-hidden relative bg-gray-100 text-gray-900 font-sans">
        {/* Invisible backdrop behind left sidebar — prevents map triggers */}
        <div className="fixed top-0 left-0 bottom-0 z-30 hidden w-[400px] md:block" />

        <button
          onClick={() => {
            setIsWidgetPanelOpen(false);
            setMobileSidebarOpen((value) => !value);
          }}
          className="fixed left-4 top-4 z-[60] flex h-14 items-center gap-3 overflow-hidden rounded-2xl border border-black/15 bg-[#f8f6f1]/95 px-4 shadow-[0px_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden"
          aria-label={mobileSidebarOpen ? "Close layers drawer" : "Open layers drawer"}
        >
          <div className="grid h-8 w-8 grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-black/10">
            <div className="bg-[#ff0000]" />
            <div className="bg-[#ffff00]" />
            <div className="bg-[#0000ff]" />
            <div className="bg-[#111111]" />
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-neutral-500">Layers</span>
            <span className="text-[16px] font-black tracking-tight text-neutral-950">Open Drawer</span>
          </div>
          <Layers3 className="h-5 w-5 text-neutral-700" />
        </button>

        <Sidebar 
          mode={mode}
          setMode={setMode}
          selectedPoint={selectedPoint} 
          drawingPath={drawingPath}
          editingTraceId={editingTraceId}
          editingAreaId={editingAreaId}
          editingPinData={editingPinData}
          traceDraftFinalized={traceDraftFinalized}
          curveMode={curveMode}
          setCurveMode={setCurveMode}
          terrain3D={terrain3D}
          setTerrain3D={setTerrain3D}
          isSatellite={isSatellite}
          setIsSatellite={setIsSatellite}
          onResetView={() => setResetViewTrigger((value) => value + 1)}
          onClearSelection={handleCancel}
          onUndo={handleUndo}
          onDataSaved={handleDataSaved}
          refreshTrigger={dbRefreshTrigger}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          collections={collections}
          layerVisibility={layerVisibility}
          setCollections={setCollections}
          activeCollectionId={activeCollectionId}
          setActiveCollectionId={setActiveCollectionId}
          pendingPin={pendingPin}
          onCollectionConfirm={confirmCollectionSelection}
          onToggleCollectionVisibility={toggleCollectionVisibility}
          onShowOnlyCollection={showOnlyCollection}
          autoOpenCollectionId={autoOpenCollectionId}
          onFinishTraceDraft={handleFinishTraceDraft}
          selectedTraceNodeIndex={selectedTraceNodeIndex}
          onRemoveSelectedTraceNode={handleRemoveSelectedTraceNode}
          onCollectionUpdated={() => setDbRefreshTrigger((value) => value + 1)}
        />

            <MapCanvas 
              mode={mode}
              onMapClick={handleMapClick} 
              onTraceSelected={handleTraceSelected}
              onAreaSelected={handleAreaSelected}
              onPinSelected={handlePinSelected}
              onPendingPinCancel={handlePendingPinCancel}
              onTraceNodeClick={handleTraceNodeClick}
              selectedTraceNodeIndex={selectedTraceNodeIndex}
              selectedPoint={selectedPoint}
              drawingPath={drawingPath}
              setDrawingPath={setDrawingPath}
              editingTraceId={editingTraceId}
              editingAreaId={editingAreaId}
              traceDraftFinalized={traceDraftFinalized}
              curveMode={curveMode}
              terrain3D={terrain3D}
              isSatellite={isSatellite}
              resetViewTrigger={resetViewTrigger}
              refreshTrigger={dbRefreshTrigger}
              hiddenCollectionIds={invisibleCollectionIds}
            />

            {/* Invisible backdrop behind right WidgetOverlay — prevents map triggers */}
            {mode === 'editPin' && !!editingPinData && (
              <div className="fixed top-0 right-0 bottom-0 z-45 hidden w-[520px] md:block" />
            )}
            
            <WidgetOverlay 
              isOpen={mode === 'editPin' && !!editingPinData} 
              onClose={() => { setEditingPinData(null); setMode('pin'); }}
              onDataSaved={handleDataSaved}
              onDeletePin={handleDeleteSavedPin}
              entityType="pin"
              entityId={editingPinData?.id}
              data={editingPinData ? {
                id: editingPinData.id,
                title: editingPinData.name || "Untitled Marker",
                description: editingPinData.note || "",
                imageUrl: editingPinData.image_url,
                collectionId: editingPinData.collectionId,
                tags: ["Curated Map", "Location"],
              } : undefined}
            />

            <WidgetPanel
              isOpen={isWidgetPanelOpen}
              onClose={() => setIsWidgetPanelOpen(false)}
            />
            
            {/* SPATIAL FLOATING CORNER WIDGETS */}
            <div className="fixed top-6 right-6 z-40 flex gap-4 pointer-events-none">
               <button
                 onClick={() => {
                   setEditingPinData(null);
                   setMobileSidebarOpen(false);
                   setMode('pin');
                   setIsWidgetPanelOpen((value) => !value);
                 }}
                 className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center shadow-sm px-4 py-2 pointer-events-auto hover:bg-white/40 transition-colors cursor-pointer gap-2 fixed right-4 top-4 md:static md:right-auto md:top-auto"
               >
                 <div className="grid grid-cols-2 gap-[2px]">
                   <div className="w-[6px] h-[6px] rounded-[1px] bg-black/40" />
                   <div className="w-[6px] h-[6px] rounded-[1px] bg-black/40" />
                   <div className="w-[6px] h-[6px] rounded-[1px] bg-black/40" />
                   <div className="w-[6px] h-[6px] rounded-[1px] bg-black/40" />
                 </div>
                 <span className="font-bold text-xs">Widgets</span>
                 <span className="text-[10px]">✨</span>
               </button>

               <div className="hidden bg-white/20 backdrop-blur-xl border border-white/20 rounded-full md:flex items-center shadow-sm p-1 pr-4 pointer-events-auto hover:bg-white/40 transition-colors cursor-pointer gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-inner">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                 </div>
                 <div className="flex flex-col justify-center">
                   <span className="text-[10px] font-black uppercase tracking-wider leading-none">Curator</span>
                   <span className="text-[8px] text-black/50 uppercase tracking-widest leading-none mt-0.5">Premium</span>
                 </div>
               </div>
            </div>

      </div>
    </WidgetProvider>
  );
}
