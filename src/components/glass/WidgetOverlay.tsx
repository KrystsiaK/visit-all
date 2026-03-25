import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getEntityWidgetPayload, getEntityWidgets, updatePinDetails, deletePin } from "@/app/actions";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import type { WidgetEntityPayload, WidgetEntityType, WidgetInstanceRecord } from "@/lib/widgets";
import { EntityInfoWidgetCard } from "@/components/widgets/EntityInfoWidgetCard";
import { EntityDeleteWidgetCard } from "@/components/widgets/EntityDeleteWidgetCard";
import { Tooltip } from "@/components/ui/Tooltip";

interface WidgetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSaved?: () => void;
  onDeletePin?: (pinId: string, collectionId?: string) => Promise<void>;
  entityType?: WidgetEntityType;
  entityId?: string;
  data?: {
    id: string;
    title: string;
    subtitle?: string;
    location?: string;
    date?: string;
    tags?: string[];
    description?: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
    collectionId?: string;
  };
}

export function WidgetOverlay({ isOpen, onClose, onDataSaved, onDeletePin, entityType, entityId, data }: WidgetOverlayProps) {
  const widgetInteractionsDeferred = true;
  const [entityTitle, setEntityTitle] = useState("");
  const [pinNote, setPinNote] = useState("");
  const [pinImage, setPinImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [entityPayload, setEntityPayload] = useState<WidgetEntityPayload | null>(null);
  const [entityWidgets, setEntityWidgets] = useState<WidgetInstanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const latestDraftRef = useRef({ title: "", note: "", imageUrl: null as string | null });
  const lastPersistedRef = useRef({ title: "", note: "", imageUrl: null as string | null });

  const persistPinDetails = useCallback(async (override?: Partial<{ title: string; note: string; imageUrl: string | null }>) => {
    if (!data?.id) {
      return;
    }

    const nextDraft = {
      ...latestDraftRef.current,
      ...override,
    };

    const hasChanges =
      nextDraft.title !== lastPersistedRef.current.title ||
      nextDraft.note !== lastPersistedRef.current.note ||
      nextDraft.imageUrl !== lastPersistedRef.current.imageUrl;

    if (!hasChanges) {
      return;
    }

    setSaving(true);
    try {
      await updatePinDetails(data.id, nextDraft.title, nextDraft.note, nextDraft.imageUrl);
      lastPersistedRef.current = nextDraft;
      latestDraftRef.current = nextDraft;
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, [data?.id]);

  useEffect(() => {
    if (data) {
      const initialTitle = data.title || "";
      const initialNote = data.description || "";
      const initialImage = data.imageUrl || null;

      setEntityTitle(initialTitle);
      setPinNote(initialNote);
      setPinImage(initialImage);
      setImageFile(null);
      latestDraftRef.current = { title: initialTitle, note: initialNote, imageUrl: initialImage };
      lastPersistedRef.current = { title: initialTitle, note: initialNote, imageUrl: initialImage };
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen || !entityType || !entityId) {
      setEntityPayload(null);
      setEntityWidgets([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const [payload, widgets] = await Promise.all([
          getEntityWidgetPayload(entityType, entityId),
          getEntityWidgets(entityType, entityId),
        ]);

        if (!cancelled) {
          setEntityPayload(payload);
          setEntityWidgets(widgets);
          const payloadTitle = payload.title || "";
          const payloadNote = payload.description || "";
          const payloadImage = payload.imageUrl || null;

          setEntityTitle(payloadTitle);
          setPinNote(payloadNote);
          setPinImage(payloadImage);
          latestDraftRef.current = { title: payloadTitle, note: payloadNote, imageUrl: payloadImage };
          lastPersistedRef.current = { title: payloadTitle, note: payloadNote, imageUrl: payloadImage };
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entityId, entityType, isOpen]);

  const debouncedPersist = useDebouncedCallback(() => {
    void persistPinDetails();
  }, 600);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (widgetInteractionsDeferred) {
      return;
    }
    const nextTitle = event.target.value;
    setEntityTitle(nextTitle);
    latestDraftRef.current = { ...latestDraftRef.current, title: nextTitle };
    debouncedPersist();
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (widgetInteractionsDeferred) {
      return;
    }
    const nextNote = e.target.value;
    setPinNote(nextNote);
    latestDraftRef.current = { ...latestDraftRef.current, note: nextNote };
    debouncedPersist();
  };

  const handleImageUpload = async (file: File) => {
    if (widgetInteractionsDeferred) return;
    if (!data?.id) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed");
      }

      const url = payload.url;
      setPinImage(url);
      latestDraftRef.current = { ...latestDraftRef.current, imageUrl: url };
      await persistPinDetails({ imageUrl: url });
      onDataSaved?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleImageDelete = async () => {
    if (widgetInteractionsDeferred) return;
    if (!data?.id) return;
    setSaving(true);
    setPinImage(null);
    try {
      latestDraftRef.current = { ...latestDraftRef.current, imageUrl: null };
      await persistPinDetails({ imageUrl: null });
      onDataSaved?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (widgetInteractionsDeferred) return;
    if (!data?.id) return;
    setSaving(true);
    try {
      if (onDeletePin) {
        await onDeletePin(data.id, data.collectionId);
      } else {
        await deletePin(data.id);
        onDataSaved?.();
      }
      setDeleteWarningOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!widgetInteractionsDeferred) {
      await persistPinDetails();
    }
    if (onDataSaved) {
      onDataSaved();
      return;
    }

    onClose();
  };

  if (!data && !entityPayload) return null;

  const activeData = data ?? {
    id: entityPayload?.id || "",
    title: entityPayload?.title || "Untitled Entity",
    subtitle: entityPayload?.subtitle || undefined,
    description: entityPayload?.description || undefined,
    imageUrl: entityPayload?.imageUrl || undefined,
    collectionId: entityPayload?.collection?.id,
    tags: entityWidgets.map((widget) => widget.name),
  };

  const supportsDirectPinEditing = entityType === "pin" || !entityType;
  const resolvedTitle = entityTitle || activeData.title;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close entity widgets"
            onClick={() => void handleClose()}
            className="fixed inset-0 z-[48] bg-black/12 backdrop-blur-[1px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {deleteWarningOpen && (
            <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/18 backdrop-blur-sm p-6">
              <div className="w-full max-w-[420px] overflow-hidden rounded-[28px] border border-black/15 bg-[#f8f6f1] shadow-[0px_20px_60px_rgba(0,0,0,0.18)]">
                <div className="flex h-3">
                  <div className="flex-1 bg-[#ff0000]" />
                  <div className="flex-1 bg-[#ffff00]" />
                  <div className="flex-1 bg-[#0000ff]" />
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-500">Delete Pin</p>
                  <h3 className="mt-3 text-[28px] leading-[0.95] font-black uppercase tracking-tight text-neutral-950">
                    {activeData.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-neutral-700">
                    This pin, its entity widgets, and any uploaded image tied to it will be permanently deleted.
                  </p>
                </div>
                <div className="grid grid-cols-2 border-t border-black/10">
                  <button
                    onClick={() => setDeleteWarningOpen(false)}
                    className="h-16 bg-[#f8f6f1] text-sm font-black uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleDelete()}
                    disabled={saving}
                    className="h-16 border-l border-black/10 bg-[#111111] text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#ff0000]"
                  >
                    {saving ? "Deleting..." : "Delete Pin"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Widget Container */}
          <motion.div
            className="fixed inset-x-3 bottom-3 top-auto z-50 h-[min(78vh,720px)] pointer-events-none md:inset-x-auto md:right-8 md:top-28 md:bottom-6 md:h-auto md:w-[376px]"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 36 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="h-full pointer-events-auto">
              <div className="flex h-full flex-col gap-3 overflow-hidden md:gap-4 md:py-6">
                <div className="flex justify-center md:hidden">
                  <div className="h-1.5 w-14 rounded-full bg-black/12" />
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
                  <div className="flex items-start justify-between">
                    <div>
                      {supportsDirectPinEditing ? (
                        <input
                          type="text"
                          value={resolvedTitle}
                          onChange={handleTitleChange}
                          placeholder="Untitled Marker"
                          disabled={widgetInteractionsDeferred}
                          className="w-full bg-transparent p-0 text-[24px] font-semibold leading-8 tracking-tight text-[#171717] outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-80"
                        />
                      ) : (
                        <h2 className="text-[24px] font-semibold leading-8 tracking-tight text-[#171717]">
                          {resolvedTitle}
                        </h2>
                      )}
                      <p className="mt-1 text-sm leading-5 text-[#737373]">
                        {activeData.subtitle || (entityType ? `${entityType} widget` : "Entity widget")}
                      </p>
                      {loading && (
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                          Loading widgets...
                        </p>
                      )}
                    </div>
                    <Tooltip label="Close Panel">
                      <button
                        onClick={() => void handleClose()}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
                        aria-label="Close entity widgets"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1">
                  {entityWidgets.map((widget) => {
                    const normalizedEntity = entityPayload ?? {
                      id: activeData.id,
                      type: (entityType || "pin"),
                      title: resolvedTitle,
                      subtitle: activeData.subtitle || null,
                      description: activeData.description || null,
                      imageUrl: activeData.imageUrl || null,
                      collection: null,
                      geometryKind: entityType === "trace" ? "line" : entityType === "area" ? "polygon" : "point",
                      metadata: {},
                    };

                    if (widget.componentKey === "entity_info") {
                      return (
                        <EntityInfoWidgetCard
                          key={widget.id}
                          widget={widget}
                          entity={normalizedEntity}
                          pinNote={pinNote}
                          pinImage={pinImage}
                          imageFile={imageFile}
                          saving={saving}
                          editable={supportsDirectPinEditing}
                          interactionsDisabled={widgetInteractionsDeferred}
                          onNoteChange={handleNoteChange}
                          onImageUpload={handleImageUpload}
                          onImageDelete={handleImageDelete}
                        />
                      );
                    }

                    if (widget.componentKey === "entity_delete" && supportsDirectPinEditing) {
                      return (
                        <EntityDeleteWidgetCard
                          key={widget.id}
                          widget={widget}
                          entity={normalizedEntity}
                          saving={saving}
                          disabled={widgetInteractionsDeferred}
                          onDelete={() => setDeleteWarningOpen(true)}
                        />
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
