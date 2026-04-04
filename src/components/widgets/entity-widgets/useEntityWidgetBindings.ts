"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import {
  deletePin,
  getEntityRating,
  getEntityWidgetPayload,
  getEntityWidgets,
  reorderEntityWidgets,
  updateEntityRating,
  updatePinDetails,
} from "@/app/actions";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import type { WidgetEntityPayload, WidgetEntityType, WidgetInstanceRecord } from "@/lib/widgets";
import { useShellWidgetReorder } from "@/components/shells/useShellWidgetReorder";

interface EntityOverlayData {
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
}

interface UseEntityWidgetBindingsProps {
  isOpen: boolean;
  refreshTrigger?: number;
  entityType?: WidgetEntityType;
  entityId?: string;
  data?: EntityOverlayData;
  onDataSaved?: () => void;
  onClose: () => void;
  onDeletePin?: (pinId: string, collectionId?: string) => Promise<void>;
}

export interface EntityWidgetBindingsResult {
  widgetInteractionsDeferred: boolean;
  entityTitle: string;
  pinNote: string;
  pinImage: string | null;
  imageFile: File | null;
  saving: boolean;
  deleteWarningOpen: boolean;
  entityRating: number | null;
  entityPayload: WidgetEntityPayload | null;
  entityWidgets: WidgetInstanceRecord[];
  loading: boolean;
  draggedWidgetId: string | null;
  dropTarget: { widgetId: string; edge: "before" | "after" } | null;
  activeData: EntityOverlayData;
  normalizedEntity: WidgetEntityPayload;
  supportsDirectPinEditing: boolean;
  handleDragStart: (event: DragEvent<HTMLDivElement>, widgetId: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (event: DragEvent<HTMLDivElement>, widgetId: string) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>, widgetId: string) => void;
  handleNoteChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleImageUpload: (file: File) => Promise<void>;
  handleImageDelete: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRateEntity: (value: number) => Promise<void>;
  handleClose: () => Promise<void>;
  setDeleteWarningOpen: (open: boolean) => void;
}

export const useEntityWidgetBindings = ({
  isOpen,
  refreshTrigger = 0,
  entityType,
  entityId,
  data,
  onDataSaved,
  onClose,
  onDeletePin,
}: UseEntityWidgetBindingsProps): EntityWidgetBindingsResult => {
  const widgetInteractionsDeferred = true;
  const [entityTitle, setEntityTitle] = useState("");
  const [pinNote, setPinNote] = useState("");
  const [pinImage, setPinImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [entityRating, setEntityRating] = useState<number | null>(null);
  const [entityPayload, setEntityPayload] = useState<WidgetEntityPayload | null>(null);
  const [entityWidgets, setEntityWidgets] = useState<WidgetInstanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const latestDraftRef = useRef({ title: "", note: "", imageUrl: null as string | null });
  const lastPersistedRef = useRef({ title: "", note: "", imageUrl: null as string | null });

  const {
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useShellWidgetReorder({
    widgets: entityWidgets,
    onReorder: (nextWidgets) => {
      setEntityWidgets(nextWidgets);

      if (!entityType || !entityId) {
        return;
      }

      void reorderEntityWidgets(
        entityType,
        entityId,
        nextWidgets.map((widget) => widget.id)
      ).catch((error) => {
        console.error(error);
      });
    },
  });

  const persistPinDetails = useCallback(
    async (override?: Partial<{ title: string; note: string; imageUrl: string | null }>) => {
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
    },
    [data?.id]
  );

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
      setEntityRating(null);
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

          const containerId = payload.metadata?.containerId;
          if (typeof containerId === "string" && entityType === "pin") {
            const rating = await getEntityRating(containerId);
            if (!cancelled) {
              setEntityRating(rating);
            }
          } else if (!cancelled) {
            setEntityRating(null);
          }
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
  }, [entityId, entityType, isOpen, refreshTrigger]);

  const debouncedPersist = useDebouncedCallback(() => {
    void persistPinDetails();
  }, 600);

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (widgetInteractionsDeferred) {
      return;
    }

    const nextNote = event.target.value;
    setPinNote(nextNote);
    latestDraftRef.current = { ...latestDraftRef.current, note: nextNote };
    debouncedPersist();
  };

  const handleImageUpload = async (file: File) => {
    if (widgetInteractionsDeferred || !data?.id) {
      return;
    }

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
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageDelete = async () => {
    if (widgetInteractionsDeferred || !data?.id) {
      return;
    }

    setSaving(true);
    setPinImage(null);
    try {
      latestDraftRef.current = { ...latestDraftRef.current, imageUrl: null };
      await persistPinDetails({ imageUrl: null });
      onDataSaved?.();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (widgetInteractionsDeferred || !data?.id) {
      return;
    }

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

  const handleRateEntity = async (value: number) => {
    const containerId = entityPayload?.metadata?.containerId;

    if (typeof containerId !== "string" || widgetInteractionsDeferred) {
      return;
    }

    setEntityRating(value);
    setSaving(true);
    try {
      const nextValue = await updateEntityRating(containerId, value);
      setEntityRating(nextValue);
    } catch (error) {
      console.error(error);
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
  const normalizedEntity = entityPayload ?? {
    id: activeData.id,
    type: entityType || "pin",
    title: resolvedTitle,
    subtitle: activeData.subtitle || null,
    description: activeData.description || null,
    imageUrl: activeData.imageUrl || null,
    collection: null,
    geometryKind: entityType === "trace" ? "line" : entityType === "area" ? "polygon" : "point",
    metadata: {},
  };

  return {
    widgetInteractionsDeferred,
    entityTitle,
    pinNote,
    pinImage,
    imageFile,
    saving,
    deleteWarningOpen,
    entityRating,
    entityPayload,
    entityWidgets,
    loading,
    draggedWidgetId,
    dropTarget,
    activeData,
    normalizedEntity,
    supportsDirectPinEditing,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleNoteChange,
    handleImageUpload,
    handleImageDelete,
    handleDelete,
    handleRateEntity,
    handleClose,
    setDeleteWarningOpen,
  };
};
