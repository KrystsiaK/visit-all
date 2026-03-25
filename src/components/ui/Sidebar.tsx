"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { createCollection, updateCollection, deleteCollection } from "@/app/actions";
import type { InteractionMode, Collection } from "@/app/page";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "../glass/GlassPanel";
import { MapPin, Route, Pentagon, Focus, Mountain, Waves, Plus, Search, Settings2, Eye, EyeOff, Globe2, RotateCcw, Trash2 } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { Tooltip } from "./Tooltip";
import {
  getLayerVisibilityFlags,
  hasAnySolo,
  type LayerVisibilityState,
} from "@/lib/layer-visibility";

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
  collections: Collection[];
  layerVisibility: LayerVisibilityState;
  setCollections: Dispatch<SetStateAction<Collection[]>>;
  activeCollectionId: string;
  setActiveCollectionId: (val: string) => void;
  pendingPin: { lng: number; lat: number } | null;
  onCollectionConfirm: (collectionId: string) => Promise<void>;
  onToggleCollectionVisibility: (collectionId: string) => void;
  onShowOnlyCollection: (collectionId: string) => void;
  autoOpenCollectionId: string | null;
  onFinishTraceDraft: () => void;
  selectedTraceNodeIndex?: number | null;
  onRemoveSelectedTraceNode?: () => void;
  onCollectionUpdated?: () => void;
}

export default function Sidebar({ 
  mode, setMode, drawingPath, 
  traceDraftFinalized,
  curveMode, setCurveMode, terrain3D, setTerrain3D, isSatellite, setIsSatellite, onResetView,
  onClearSelection, onDataSaved,
  mobileSidebarOpen, setMobileSidebarOpen,
  collections, layerVisibility, setCollections, activeCollectionId, setActiveCollectionId
  , pendingPin, onCollectionConfirm, onToggleCollectionVisibility, onShowOnlyCollection, autoOpenCollectionId, onFinishTraceDraft, selectedTraceNodeIndex = null, onRemoveSelectedTraceNode, onCollectionUpdated
}: SidebarProps) {
  
  const [saving, setSaving] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionPendingDelete, setCollectionPendingDelete] = useState<Collection | null>(null);
  const awaitingLayerSelection =
    (mode === "pin" && !!pendingPin) ||
    (mode === "trace" && traceDraftFinalized);

  const itemLabel =
    mode === "trace" || mode === "editTrace"
      ? "path"
      : mode === "area" || mode === "editArea"
        ? "zone"
        : "pin";

  const debouncedCollectionUpdate = useDebouncedCallback(async (id: string, name: string, color: string, icon: string) => {
    setSaving(true);
    try {
      await updateCollection(id, name, color, icon);
      onCollectionUpdated?.();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, 500);

  useEffect(() => {
    if (!autoOpenCollectionId) {
      return;
    }

    const targetCollection = collections.find((collection) => collection.id === autoOpenCollectionId);
    if (targetCollection) {
      setEditingCollection(targetCollection);
    }
  }, [autoOpenCollectionId, collections]);

  useEffect(() => {
    if (editingCollection && !collections.some((collection) => collection.id === editingCollection.id)) {
      setEditingCollection(null);
    }
  }, [editingCollection, collections]);

  const handleCreateCollection = async () => {
    setSaving(true);
    try {
      // Derive collection type from current mode
      const collType = mode === 'trace' || mode === 'editTrace' ? 'trace' 
                     : mode === 'area' || mode === 'editArea' ? 'area' 
                     : 'pin';
      const newCol = await createCollection("UNTITLED LAYER", "#0000ff", "!", collType);
      setCollections((currentCollections) => [newCol, ...currentCollections]);
      setEditingCollection(newCol);
      setActiveCollectionId(newCol.id);
    } catch (error) { console.error(error); }
    finally { setSaving(false) }
  };

  const handleEditCollectionChange = (field: "name" | "color" | "icon", value: string) => {
    if (!editingCollection) return;
    const updated = { ...editingCollection, [field]: value };
    setEditingCollection(updated);
    setCollections((currentCollections) =>
      currentCollections.map((collection) =>
        collection.id === updated.id ? { ...collection, [field]: value } : collection
      )
    );
    debouncedCollectionUpdate(updated.id, updated.name, updated.color, updated.icon);
  };

  const handleCollectionCardClick = async (collection: Collection) => {
    if (editingCollection?.id === collection.id) {
      return;
    }

    if (!awaitingLayerSelection) {
      setActiveCollectionId(collection.id);
      setEditingCollection(collection);
      return;
    }

    setActiveCollectionId(collection.id);

    if (awaitingLayerSelection) {
      await onCollectionConfirm(collection.id);
      setMobileSidebarOpen?.(false);
    }
  };

  const handleCollectionDone = async (collectionId: string) => {
    setEditingCollection(null);
    setCollections((currentCollections) => {
      const nextCollections = [...currentCollections];
      const selectedIndex = nextCollections.findIndex((item) => item.id === collectionId);

      if (selectedIndex <= 0) {
        return nextCollections;
      }

      const [selectedCollection] = nextCollections.splice(selectedIndex, 1);
      nextCollections.unshift(selectedCollection);
      return nextCollections;
    });
    await onCollectionConfirm(collectionId);
    setMobileSidebarOpen?.(false);
  };

  const handleDeleteCollection = async (id: string) => {
    setSaving(true);
    try {
      await deleteCollection(id);
      if (activeCollectionId === id) setActiveCollectionId("");
      setEditingCollection(null);
      setCollectionPendingDelete(null);
      setCollections((currentCollections) => currentCollections.filter((collection) => collection.id !== id));
      onDataSaved();
    } catch { alert("Unable to delete layer."); } 
    finally { setSaving(false); }
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
      <motion.div
        className={`fixed bottom-4 left-4 top-4 z-40 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-4 overflow-y-auto no-scrollbar pointer-events-none transition-transform transform duration-300 md:bottom-6 md:left-6 md:top-6 md:w-[360px] ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1.5rem)]'} md:translate-x-0`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex flex-col gap-4 min-h-max pb-6">
          
          {/* 1. APP HEADER PILL */}
          <div className="bg-white/25 backdrop-blur-xl rounded-2xl p-4 shadow-sm pointer-events-auto border border-white/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <div className="grid h-10 w-10 grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-black/10 bg-white/70 shadow-sm">
                 <div className="bg-[#ff0000]" />
                 <div className="bg-[#ffff00]" />
                 <div className="bg-[#0000ff]" />
                 <div className="bg-[#111111]" />
               </div>
               <div className="flex flex-col justify-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-500">Synarava</span>
                 <span className="text-[18px] font-black tracking-tight text-neutral-900">Visit</span>
               </div>
            </div>
            <Tooltip label="Coming Soon">
              <button disabled className="w-8 h-8 flex items-center justify-center text-neutral-300 opacity-60">
                <Settings2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* 2. SEARCH PILL */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 pointer-events-auto border border-white/15 flex items-center gap-3 relative overflow-hidden shrink-0">
             <Search className="w-4 h-4 text-neutral-400 ml-1" />
             <input type="text" placeholder="Search collections..." className="bg-transparent border-none outline-none text-sm placeholder-neutral-400 w-full font-medium" />
             <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-r from-transparent to-white/15 pointer-events-none" />
          </div>

          <div className="flex flex-col gap-4 pointer-events-auto">
                   
                   {mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized && (
                     <div className="flex flex-col gap-3">
                       <motion.button
                         type="button"
                         onClick={() => onRemoveSelectedTraceNode?.()}
                         disabled={selectedTraceNodeIndex === null}
                         className={`group relative flex h-20 overflow-hidden rounded-2xl border shadow-[0px_10px_28px_rgba(0,0,0,0.12)] ${
                           selectedTraceNodeIndex === null
                             ? "cursor-not-allowed border-black/10 bg-[#ebe8df] opacity-60"
                             : "border-[#7d0f1f]/25 bg-[#fff4f4]"
                         }`}
                         whileHover={selectedTraceNodeIndex === null ? undefined : { scale: 1.015, y: -1 }}
                         whileTap={selectedTraceNodeIndex === null ? undefined : { scale: 0.985 }}
                       >
                         <div className="flex w-16 flex-col">
                           <div className="h-10 bg-[#111111]" />
                           <div className="h-10 bg-[#ff0000]" />
                         </div>
                         <div className="flex w-16 items-center justify-center border-l border-black/10 border-r border-black/10 bg-[#fdf8f6]">
                           <Trash2 className={`h-6 w-6 transition-transform duration-200 ${selectedTraceNodeIndex === null ? "text-neutral-400" : "text-[#7d0f1f] group-hover:scale-110"}`} />
                         </div>
                         <div className="relative flex flex-1 flex-col justify-center px-5 text-left">
                           <div className="absolute inset-y-0 right-0 w-6 bg-white/50" />
                           <span className="text-[10px] font-black uppercase tracking-[0.26em] text-neutral-500">
                             {selectedTraceNodeIndex === null ? "Select Point" : `Point ${selectedTraceNodeIndex + 1} Ready`}
                           </span>
                           <span className={`mt-1 text-[22px] font-black uppercase tracking-tight ${selectedTraceNodeIndex === null ? "text-neutral-400" : "text-[#7d0f1f]"}`}>
                             Remove Point
                           </span>
                         </div>
                       </motion.button>

                       <motion.button
                         onClick={onFinishTraceDraft}
                         className="group relative flex h-20 overflow-hidden rounded-2xl border border-black/20 bg-[#f8f6f1] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
                         whileHover={{ scale: 1.015, y: -1 }}
                         whileTap={{ scale: 0.985 }}
                       >
                         <div className="flex w-16 flex-col">
                           <div className="h-10 bg-[#000000]" />
                           <div className="h-10 bg-[#0000ff]" />
                         </div>
                         <div className="flex w-16 items-center justify-center bg-[#f8f6f1] border-l border-black/15 border-r border-black/15">
                           <Route className="w-6 h-6 text-black transition-transform duration-200 group-hover:scale-110" />
                         </div>
                         <div className="relative flex flex-1 flex-col justify-center bg-[#f8f6f1] px-5 text-left">
                           <div className="absolute inset-y-0 right-0 w-6 bg-white/60" />
                           <span className="text-[10px] font-black uppercase tracking-[0.26em] text-neutral-500">Path Ready</span>
                           <span className="mt-1 text-[22px] font-black uppercase tracking-tight text-neutral-950">Finish Path</span>
                         </div>
                       </motion.button>
                     </div>
                   )}

                   {/* NAVIGATIONAL MODES (GLOBAL PINS, PATHS, ZONES) */}
                   <GlassPanel intensity="heavy" className="p-1.5 shrink-0" shadow={false}>
                     <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => { setMode('pin'); onClearSelection(); setEditingCollection(null); }} className={`px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex flex-col items-center gap-1.5 ${mode === 'pin' ? 'bg-[#0000ff] text-white' : 'text-neutral-500 hover:bg-white/30 hover:text-neutral-800'}`}>
                           <MapPin className="w-4 h-4" /> PINS
                        </button>
                        <button onClick={() => { setMode('trace'); onClearSelection(); setEditingCollection(null); }} className={`px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex flex-col items-center gap-1.5 ${mode === 'trace' ? 'bg-[#ff0000] text-white' : 'text-neutral-500 hover:bg-white/30 hover:text-neutral-800'}`}>
                           <Route className="w-4 h-4" /> PATHS
                        </button>
                        <button disabled className="px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex flex-col items-center gap-1.5 text-neutral-300 cursor-not-allowed opacity-60">
                           <Pentagon className="w-4 h-4" /> ZONES
                        </button>
                     </div>
                   </GlassPanel>

                   {/* COLLECTIONS DIRECTORY */}
                   {collections.length > 0 && (
                     <GlassPanel
                       intensity="heavy"
                       className="flex flex-col shrink-0 relative p-[17px] mb-2 overflow-hidden rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.08)]"
                       border="dark"
                     >
                       {awaitingLayerSelection && (
                         <>
                           <motion.div
                             className="pointer-events-none absolute inset-0"
                             animate={{
                               opacity: [0.38, 0.72, 0.38],
                               boxShadow: [
                                 "inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 rgba(47,107,255,0)",
                                 "inset 0 0 0 1px rgba(255,255,255,0.24), 0 0 32px rgba(255,213,74,0.14)",
                                 "inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 rgba(47,107,255,0)"
                               ]
                             }}
                             transition={{ duration: 2.4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                             style={{
                               backgroundImage: "linear-gradient(135deg, rgba(47,107,255,0.16), rgba(255,213,74,0.28), rgba(230,57,70,0.12), rgba(255,255,255,0.05))",
                             }}
                           />
                           <motion.div
                             className="pointer-events-none absolute inset-y-0 -left-1/2 w-[70%]"
                             animate={{ x: ["0%", "220%"] }}
                             transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                             style={{
                               background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))",
                               filter: "blur(14px)",
                               transform: "skewX(-20deg)",
                             }}
                           />
                         </>
                       )}
                       <div className="max-h-[344px] overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2 pt-0.5 pr-1">
                          <AnimatePresence initial={false}>
                          {collections.map(c => {
                            const isEditing = editingCollection?.id === c.id;
                            const flags = getLayerVisibilityFlags(layerVisibility, c.id);
                            const hasSolo = hasAnySolo(layerVisibility);
                            const isMuted = flags.muted;
                            const isSolo = flags.solo;
                            const focusTooltipLabel = isSolo
                              ? "Stop Showing Only This Layer"
                              : hasSolo
                                ? "Add This Layer To Show Only"
                                : "Show Only This Layer";

                            return (
                              <motion.div
                                key={c.id}
                                data-testid="layer-card"
                                data-layer-id={c.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                whileHover={!isEditing ? { scale: 1.02 } : undefined}
                                whileTap={!isEditing ? { scale: 0.98 } : undefined}
                                onClick={() => void handleCollectionCardClick(c)}
                                className={`overflow-hidden cursor-pointer flex rounded-xl ${
                                  isEditing
                                    ? "bg-white/60 border border-black/10 shadow-sm"
                                    : activeCollectionId === c.id
                                      ? "bg-white/60 border border-black/10 shadow-sm"
                                      : "bg-white/30 border border-black/5 hover:bg-white/40"
                                }`}
                                style={{ minHeight: 66 }}
                              >
                                {/* Color Bar — spans full card height */}
                                <div
                                  className="ml-[13px] mt-[13px] h-10 w-1 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: isEditing ? (editingCollection?.color || c.color) : c.color }}
                                />

                                {/* Card content column */}
                                <div className="flex-1 min-w-0">
                                  {/* Header row */}
                                  <div className="flex items-center justify-between px-[12px] py-[13px] min-h-[64px]">
                                    <div className="flex-1 min-w-0">
                                      {isEditing ? (
                                        <input
                                          autoFocus
                                          type="text"
                                          value={editingCollection?.name ?? ""}
                                          onClick={e => e.stopPropagation()}
                                          onChange={e => handleEditCollectionChange('name', e.target.value)}
                                          className="m-0 w-full bg-transparent border-none p-0 text-[14px] leading-5 font-medium text-neutral-900 outline-none placeholder-neutral-300"
                                          placeholder="Layer name..."
                                        />
                                      ) : (
                                        <h4 className="truncate text-[14px] leading-5 font-medium text-neutral-900">{c.name}</h4>
                                      )}
                                      <p className="mt-0.5 text-[12px] leading-4 font-normal text-neutral-500">
                                        {c.itemCount} {itemLabel}{c.itemCount === 1 ? "" : "s"}
                                      </p>
                                    </div>

                                    {/* Right-side icons */}
                                    <div className="ml-3 flex flex-shrink-0 items-center gap-1.5">
                                      <Tooltip label={isMuted ? "Show Layer" : "Hide Layer"}>
                                        <button
                                          data-testid="layer-mute-button"
                                          onClick={e => {
                                            e.stopPropagation();
                                            onToggleCollectionVisibility(c.id);
                                          }}
                                          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-600"
                                          aria-label={isMuted ? "Show layer pins" : "Hide layer pins"}
                                          aria-pressed={isMuted}
                                        >
                                          {isMuted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                      </Tooltip>
                                      <Tooltip label={focusTooltipLabel}>
                                        <button
                                          data-testid="layer-solo-button"
                                          onClick={e => {
                                            e.stopPropagation();
                                            onShowOnlyCollection(c.id);
                                          }}
                                          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                                            isSolo
                                              ? "bg-black/5 text-neutral-700"
                                              : "text-neutral-400 hover:bg-black/5 hover:text-neutral-600"
                                          }`}
                                          aria-label={focusTooltipLabel}
                                          aria-pressed={isSolo}
                                        >
                                          <Focus className="w-4 h-4" />
                                        </button>
                                      </Tooltip>
                                    </div>
                                  </div>

                                  {/* --- EXPANDED EDIT PANEL --- */}
                                  <AnimatePresence initial={false}>
                                    {isEditing && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 120, opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                          height: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                                          opacity: { duration: 0.15, ease: "easeOut" }
                                        }}
                                        className="overflow-hidden"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <div className="border-t border-black/5 px-4 pb-3.5 pt-1">
                                          {/* Mondrian Color Picker */}
                                          <div className="mb-3">
                                            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400">COLOR</p>
                                            <div className="flex items-center gap-2">
                                              <div className="grid h-7 w-7 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg border border-black/10 shadow-sm">
                                                <div className="bg-[#ff0000]" />
                                                <div className="bg-[#ffff00]" />
                                                <div className="bg-[#0000ff]" />
                                                <div className="bg-[#f8f6f1]" />
                                              </div>
                                              {["#E63946", "#2F6BFF", "#FFD54A", "#1A1A1A", "#4CAF50", "#9C27B0", "#FF9800"].map(swatch => (
                                                <motion.button
                                                  key={swatch}
                                                  onClick={() => handleEditCollectionChange('color', swatch)}
                                                  whileHover={{ scale: 1.15 }}
                                                  whileTap={{ scale: 0.9 }}
                                                  className={`h-6 w-6 rounded-full border-2 transition-colors duration-150 ${
                                                    editingCollection?.color === swatch ? "border-black ring-2 ring-black/10" : "border-transparent hover:border-black/20"
                                                  }`}
                                                  style={{ backgroundColor: swatch }}
                                                />
                                              ))}
                                              <label className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-dashed border-black/15 transition-colors hover:border-black/30">
                                                <span className="text-[9px] text-neutral-400">+</span>
                                                <input
                                                  type="color"
                                                  value={editingCollection?.color ?? "#000000"}
                                                  onChange={e => handleEditCollectionChange('color', e.target.value)}
                                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                              </label>
                                            </div>
                                          </div>

                                          {/* Actions row */}
                                          <div className="flex items-center gap-2 pt-2 border-t border-black/5 pl-0.5">
                                            <button
                                              onClick={() => void handleCollectionDone(c.id)}
                                              className="group flex h-8 min-w-0 flex-[1.1] items-center gap-2 rounded-full border border-black/10 bg-white px-1.5 shadow-sm transition-transform hover:scale-[1.01] hover:border-black/15"
                                            >
                                              <div className="flex h-5 w-7 items-center justify-center gap-[3px] rounded-full bg-[#f3f1eb] px-[5px]">
                                                <span className="h-3 w-[3px] rounded-full bg-[#ff0000]" />
                                                <span className="h-3 w-[3px] rounded-full bg-[#ffff00]" />
                                                <span className="h-3 w-[3px] rounded-full bg-[#0000ff]" />
                                              </div>
                                              <div className="flex flex-1 items-center justify-center pr-2 text-[9px] font-black uppercase tracking-[0.22em] text-neutral-900">
                                                {awaitingLayerSelection ? "Done & Pin" : "Done"}
                                              </div>
                                            </button>
                                            <button
                                              onClick={() => setCollectionPendingDelete(c)}
                                              disabled={saving}
                                              className="group flex h-8 min-w-0 flex-[0.9] items-center gap-2 rounded-full border border-black/10 bg-white px-1.5 shadow-sm transition-transform hover:scale-[1.01] hover:border-black/15"
                                            >
                                              <div className="flex h-5 w-7 items-center justify-center gap-[3px] rounded-full bg-[#f3f1eb] px-[5px]">
                                                <span className="h-3 w-[3px] rounded-full bg-[#111111]" />
                                                <span className="h-3 w-[3px] rounded-full bg-[#ff0000]" />
                                                <span className="h-3 w-[3px] rounded-full bg-[#ffff00]" />
                                              </div>
                                              <div className="flex flex-1 items-center justify-center pr-2 text-[9px] font-black uppercase tracking-[0.22em] text-neutral-900 group-hover:text-[#ff0000] transition-colors">
                                                Delete
                                              </div>
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            );
                          })}
                          </AnimatePresence>
                       </div>
                    </GlassPanel>
                   )}
                   <motion.button
                     onClick={handleCreateCollection}
                     disabled={saving}
                     className="group relative flex h-20 overflow-hidden rounded-2xl border border-black/20 bg-[#f8f6f1] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
                     whileHover={{ scale: 1.015, y: -1 }}
                     whileTap={{ scale: 0.985 }}
                   >
                     <div className="flex w-16 flex-col">
                       <div className="h-10 bg-[#ff0000]" />
                       <div className="h-10 bg-[#0000ff]" />
                     </div>
                     <div className="flex w-16 items-center justify-center bg-[#ffff00] border-l border-black/15 border-r border-black/15">
                       <Plus className="w-6 h-6 text-black transition-transform duration-200 group-hover:scale-110" />
                     </div>
                     <div className="relative flex flex-1 flex-col justify-center bg-[#f8f6f1] px-5 text-left">
                       <div className="absolute inset-y-0 right-0 w-6 bg-white/60" />
                       <span className="text-[10px] font-black uppercase tracking-[0.26em] text-neutral-500">Create</span>
                       <span className="mt-1 text-[22px] font-black uppercase tracking-tight text-neutral-950">New Layer</span>
                     </div>
                   </motion.button>
                   {/* MAP CONTROLS */}
                   <GlassPanel intensity="heavy" className="p-4 shrink-0 mb-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsSatellite(!isSatellite)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-200/60 flex items-center justify-center group-hover:bg-neutral-300/60 transition-colors">
                              <Globe2 className="w-4 h-4 text-neutral-700" />
                            </div>
                            <span className="text-sm font-medium text-neutral-900 uppercase">Sat View</span>
                          </div>
                          <button className={`w-12 h-7 rounded-full transition-all duration-200 relative ${isSatellite ? "bg-[#0000ff]" : "bg-neutral-300"}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform duration-200 ${isSatellite ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between cursor-pointer group" onClick={() => setTerrain3D(!terrain3D)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-200/60 flex items-center justify-center group-hover:bg-neutral-300/60 transition-colors">
                              <Mountain className="w-4 h-4 text-neutral-700" />
                            </div>
                            <span className="text-sm font-medium text-neutral-900 uppercase">3D Terrain</span>
                          </div>
                          <button className={`w-12 h-7 rounded-full transition-all duration-200 relative ${terrain3D ? "bg-[#0000ff]" : "bg-neutral-300"}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform duration-200 ${terrain3D ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between cursor-pointer group" onClick={() => setCurveMode(!curveMode)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-200/60 flex items-center justify-center group-hover:bg-neutral-300/60 transition-colors">
                              <Waves className="w-4 h-4 text-neutral-700" />
                            </div>
                            <span className="text-sm font-medium text-neutral-900 uppercase">Smooth Curves</span>
                          </div>
                          <button className={`w-12 h-7 rounded-full transition-all duration-200 relative ${curveMode ? "bg-[#0000ff]" : "bg-neutral-300"}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform duration-200 ${curveMode ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      </div>
                   </GlassPanel>

                   <motion.button
                     onClick={onResetView}
                     className="group relative flex h-20 overflow-hidden rounded-2xl border border-black/20 bg-[#f8f6f1] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
                     whileHover={{ scale: 1.015, y: -1 }}
                     whileTap={{ scale: 0.985 }}
                   >
                     <div className="grid w-16 grid-cols-1 grid-rows-3">
                       <div className="bg-[#ff0000]" />
                       <div className="bg-[#ffff00]" />
                       <div className="bg-[#0000ff]" />
                     </div>
                     <div className="flex w-16 items-center justify-center bg-white border-l border-black/15 border-r border-black/15">
                       <RotateCcw className="w-6 h-6 text-black transition-transform duration-200 group-hover:scale-110" />
                     </div>
                     <div className="relative flex flex-1 flex-col justify-center bg-[#f8f6f1] px-5 text-left">
                       <div className="absolute inset-y-0 right-0 w-2 bg-[#ff0000]" />
                       <div className="absolute inset-y-0 right-2 w-2 bg-[#ffff00]" />
                       <div className="absolute inset-y-0 right-4 w-2 bg-[#0000ff]/85" />
                       <span className="text-[10px] font-black uppercase tracking-[0.26em] text-neutral-500">Camera</span>
                       <span className="mt-1 text-[22px] font-black uppercase tracking-tight text-neutral-950">Reset View</span>
                     </div>
                   </motion.button>
                 </div>
            
        </div>
      </motion.div>
    </>
  );
}
