"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import {
  type EntityMediaItemRecord,
  type EntityNearbyPinRecord,
  type EntityResourceLinkRecord,
  type EntityStoryEntryRecord,
  addEntityResourceLink,
  addEntityStoryEntry,
  bootstrapEntityShellState,
  deleteEntity,
  getNearbyPinsForEntity,
  getEntityMediaItems,
  getEntityRating,
  getEntityResourceLinks,
  getEntityShellSnapshot,
  getEntityStoryEntries,
  removeEntityWidget,
  removeEntityMediaItem,
  removeEntityResourceLink,
  removeEntityStoryEntry,
  removeShellWidgetPlacement,
  reorderEntityWidgets,
  updateEntityInfo,
  updateEntityTitle,
  updateEntityResourceLink,
  updateEntityRating,
  updateEntityStoryEntry,
  updateWidgetChromeBackground,
  uploadEntityMediaItem,
} from "@/app/actions";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import type { WidgetEntityPayload, WidgetEntityType, WidgetInstanceRecord } from "@/lib/widgets";
import { useShellWidgetReorder } from "@synarava/shell-kit";

interface EntityShellCacheEntry {
  entityPayload: WidgetEntityPayload | null;
  entityWidgets: WidgetInstanceRecord[];
  entityRating: number | null;
  mediaItems: EntityMediaItemRecord[];
  nearbyPins: EntityNearbyPinRecord[];
  resourceLinks: EntityResourceLinkRecord[];
  storyEntries: EntityStoryEntryRecord[];
  entityTitle: string;
  pinNote: string;
  pinImage: string | null;
  ready: boolean;
  updatedAt: number;
}

const entityShellCache = new Map<string, EntityShellCacheEntry>();

function getEntityShellCacheKey(entityType?: WidgetEntityType, entityId?: string) {
  if (!entityType || !entityId) {
    return null;
  }

  return `${entityType}:${entityId}`;
}

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
  onOpenNearbyPin?: (nearbyPin: EntityNearbyPinRecord) => void;
}

export interface EntityWidgetBindingsResult {
  widgetInteractionsDeferred: boolean;
  entityTitle: string;
  pinNote: string;
  pinImage: string | null;
  mediaItems: EntityMediaItemRecord[];
  nearbyPins: EntityNearbyPinRecord[];
  resourceLinks: EntityResourceLinkRecord[];
  storyEntries: EntityStoryEntryRecord[];
  imageFile: File | null;
  saving: boolean;
  storySaving: boolean;
  mediaSaving: boolean;
  deleteWarningOpen: boolean;
  entityRating: number | null;
  entityPayload: WidgetEntityPayload | null;
  entityWidgets: WidgetInstanceRecord[];
  pinnedEntityWidgets: WidgetInstanceRecord[];
  mainEntityWidgets: WidgetInstanceRecord[];
  loading: boolean;
  removingWidgetId: string | null;
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
  handleTitleChange: (value: string) => void;
  handleTitleCommit: () => Promise<void>;
  handleImageUpload: (file: File) => Promise<void>;
  handleImageDelete: () => Promise<void>;
  handleMediaItemDelete: (mediaItemId: string) => Promise<void>;
  handleAddResourceLink: () => Promise<void>;
  handleRemoveResourceLink: (resourceId: string) => Promise<void>;
  handleCommitResourceLink: (
    resourceId: string,
    params: { label?: string | null; url: string }
  ) => Promise<void>;
  handleSaveStoryEntry: (params: { storyEntryId?: string | null; title?: string | null; bodyMarkdown: string }) => Promise<void>;
  handleRemoveStoryEntry: (storyEntryId: string) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRemoveWidget: (widgetId: string) => Promise<void>;
  handleRateEntity: (value: number) => Promise<void>;
  handleOpenNearbyPin: (nearbyPin: EntityNearbyPinRecord) => void;
  handleUpdateWidgetBackground: (widgetId: string, backgroundStyle: string) => Promise<void>;
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
  onOpenNearbyPin,
}: UseEntityWidgetBindingsProps): EntityWidgetBindingsResult => {
  const widgetInteractionsDeferred = true;
  const [entityTitle, setEntityTitle] = useState("");
  const [pinNote, setPinNote] = useState("");
  const [pinImage, setPinImage] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<EntityMediaItemRecord[]>([]);
  const [nearbyPins, setNearbyPins] = useState<EntityNearbyPinRecord[]>([]);
  const [resourceLinks, setResourceLinks] = useState<EntityResourceLinkRecord[]>([]);
  const [storyEntries, setStoryEntries] = useState<EntityStoryEntryRecord[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [storySaving, setStorySaving] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [mediaSaving, setMediaSaving] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [entityRating, setEntityRating] = useState<number | null>(null);
  const [entityPayload, setEntityPayload] = useState<WidgetEntityPayload | null>(null);
  const [entityWidgets, setEntityWidgets] = useState<WidgetInstanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingWidgetId, setRemovingWidgetId] = useState<string | null>(null);
  const latestDraftRef = useRef({ title: "", note: "", imageUrl: null as string | null });
  const lastPersistedRef = useRef({ title: "", note: "", imageUrl: null as string | null });
  const cacheKey = getEntityShellCacheKey(entityType, entityId);

  const pinnedEntityWidgets = entityWidgets.filter((widget) => widget.slot === "pinned");
  const mainEntityWidgets = entityWidgets.filter((widget) => widget.slot !== "pinned");

  const {
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useShellWidgetReorder({
    shellId: "right_entity_shell",
    widgets: mainEntityWidgets,
    onReorder: (nextWidgets) => {
      setEntityWidgets([...pinnedEntityWidgets, ...nextWidgets]);

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
        await updateEntityInfo("pin", data.id, nextDraft.title, nextDraft.note, nextDraft.imageUrl);
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
      setMediaItems([]);
      setNearbyPins([]);
      setResourceLinks([]);
      setStoryEntries([]);
      return;
    }

    let cancelled = false;
    const cached = cacheKey ? entityShellCache.get(cacheKey) : null;
    const readyCached = cached?.ready ? cached : null;

    if (readyCached && !cancelled) {
      setEntityPayload(readyCached.entityPayload);
      setEntityWidgets(readyCached.entityWidgets);
      setEntityRating(readyCached.entityRating);
      setMediaItems(readyCached.mediaItems);
      setNearbyPins(readyCached.nearbyPins);
      setResourceLinks(readyCached.resourceLinks);
      setStoryEntries(readyCached.storyEntries);
      setEntityTitle(readyCached.entityTitle);
      setPinNote(readyCached.pinNote);
      setPinImage(readyCached.pinImage);
      latestDraftRef.current = {
        title: readyCached.entityTitle,
        note: readyCached.pinNote,
        imageUrl: readyCached.pinImage,
      };
      lastPersistedRef.current = {
        title: readyCached.entityTitle,
        note: readyCached.pinNote,
        imageUrl: readyCached.pinImage,
      };
    }

    void (async () => {
      setLoading(!readyCached);
      try {
        const {
          entityPayload: payload,
          entityWidgets: widgets,
          bootstrapRequired,
        } = await getEntityShellSnapshot(entityType, entityId);

        let resolvedPayload = payload;
        let resolvedWidgets = widgets;

        if (bootstrapRequired) {
          await bootstrapEntityShellState(entityType, entityId);
          const bootstrappedSnapshot = await getEntityShellSnapshot(entityType, entityId);
          resolvedPayload = bootstrappedSnapshot.entityPayload;
          resolvedWidgets = bootstrappedSnapshot.entityWidgets;
        }

        if (!cancelled) {
          setEntityPayload(resolvedPayload);
          setEntityWidgets(resolvedWidgets);
          const payloadTitle = resolvedPayload.title || "";
          const payloadNote = resolvedPayload.description || "";
          const payloadImage = resolvedPayload.imageUrl || null;

          setEntityTitle(payloadTitle);
          setPinNote(payloadNote);
          setPinImage(payloadImage);
          latestDraftRef.current = { title: payloadTitle, note: payloadNote, imageUrl: payloadImage };
          lastPersistedRef.current = { title: payloadTitle, note: payloadNote, imageUrl: payloadImage };
          if (cacheKey) {
            entityShellCache.set(cacheKey, {
              entityPayload: resolvedPayload,
              entityWidgets: resolvedWidgets,
              entityRating: null,
              mediaItems: [],
              nearbyPins: [],
              resourceLinks: [],
              storyEntries: [],
              entityTitle: payloadTitle,
              pinNote: payloadNote,
              pinImage: payloadImage,
              ready: false,
              updatedAt: Date.now(),
            });
          }


          const wantsMedia = resolvedWidgets.some((widget) => widget.componentKey === "entity_gallery");
          const wantsNearbyPins = resolvedWidgets.some((widget) => widget.componentKey === "entity_nearby_pins");
          const wantsResources = resolvedWidgets.some((widget) => widget.componentKey === "entity_resources");
          const wantsStories = resolvedWidgets.some((widget) => widget.componentKey === "entity_stories");
          const wantsRating = resolvedWidgets.some((widget) => widget.componentKey === "entity_rating");

          const [nextMediaItems, nextNearbyPins, nextResourceLinks, nextStoryEntries, nextRating] = await Promise.all([
            wantsMedia ? getEntityMediaItems(entityType, entityId) : Promise.resolve([]),
            wantsNearbyPins ? getNearbyPinsForEntity(entityType, entityId) : Promise.resolve([]),
            wantsResources ? getEntityResourceLinks(entityType, entityId) : Promise.resolve([]),
            wantsStories ? getEntityStoryEntries(entityType, entityId) : Promise.resolve([]),
            wantsRating && typeof resolvedPayload.metadata?.containerId === "string"
              ? getEntityRating(resolvedPayload.metadata.containerId)
              : Promise.resolve(null),
          ]);

          if (cancelled) {
            return;
          }

          setMediaItems(nextMediaItems);
          setNearbyPins(nextNearbyPins);
          setResourceLinks(nextResourceLinks);
          setStoryEntries(nextStoryEntries);
          setEntityRating(nextRating);
          if (cacheKey) {
            entityShellCache.set(cacheKey, {
              entityPayload: resolvedPayload,
              entityWidgets: resolvedWidgets,
              entityRating: nextRating,
              mediaItems: nextMediaItems,
              nearbyPins: nextNearbyPins,
              resourceLinks: nextResourceLinks,
              storyEntries: nextStoryEntries,
              entityTitle: payloadTitle,
              pinNote: payloadNote,
              pinImage: nextMediaItems[0]?.publicUrl ?? payloadImage,
              ready: true,
              updatedAt: Date.now(),
            });
          }

          if (nextMediaItems[0]?.publicUrl) {
            const nextImage = nextMediaItems[0].publicUrl;
            setPinImage(nextImage);
            latestDraftRef.current = { ...latestDraftRef.current, imageUrl: nextImage };
            lastPersistedRef.current = { ...lastPersistedRef.current, imageUrl: nextImage };
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
  }, [cacheKey, entityId, entityType, isOpen, refreshTrigger]);

  useEffect(() => {
    if (!cacheKey || !entityPayload || loading) {
      return;
    }

    entityShellCache.set(cacheKey, {
      entityPayload,
      entityWidgets,
      entityRating,
      mediaItems,
      nearbyPins,
      resourceLinks,
      storyEntries,
    entityTitle,
    pinNote,
    pinImage,
    ready: true,
    updatedAt: Date.now(),
  });
  }, [
    cacheKey,
    entityPayload,
    entityWidgets,
    entityRating,
    mediaItems,
    nearbyPins,
    resourceLinks,
    storyEntries,
    entityTitle,
    pinNote,
    pinImage,
    loading,
  ]);

  const debouncedPersist = useDebouncedCallback(() => {
    void persistPinDetails();
  }, 600);

  const persistTitle = useCallback(
    async (nextTitle: string) => {
      if (!entityType || !entityId) {
        return;
      }

      const normalizedInput = nextTitle;
      const nextNormalizedTitle =
        normalizedInput.trim() ||
        `Untitled ${entityType === "pin" ? "Marker" : entityType === "trace" ? "Path" : "Area"}`;

      if (nextNormalizedTitle === lastPersistedRef.current.title) {
        return;
      }

      setSaving(true);
      try {
        const updated = await updateEntityTitle(entityType, entityId, normalizedInput);
        setEntityTitle(updated.title);
        setEntityPayload((current) => (current ? { ...current, title: updated.title } : current));
        latestDraftRef.current = { ...latestDraftRef.current, title: updated.title };
        lastPersistedRef.current = { ...lastPersistedRef.current, title: updated.title };
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    },
    [entityId, entityType]
  );

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (widgetInteractionsDeferred) {
      return;
    }

    const nextNote = event.target.value;
    setPinNote(nextNote);
    latestDraftRef.current = { ...latestDraftRef.current, note: nextNote };
    debouncedPersist();
  };

  const handleTitleChange = (value: string) => {
    const nextTitle = value;
    setEntityTitle(nextTitle);
    latestDraftRef.current = { ...latestDraftRef.current, title: nextTitle };
    setEntityPayload((current) => (current ? { ...current, title: nextTitle } : current));
  };

  const handleOpenNearbyPin = useCallback(
    (nearbyPin: EntityNearbyPinRecord) => {
      onOpenNearbyPin?.(nearbyPin);
    },
    [onOpenNearbyPin]
  );

  const handleTitleCommit = async () => {
    await persistTitle(latestDraftRef.current.title);
  };

  const handleImageUpload = async (file: File) => {
    if (!entityType || !entityId || mediaSaving) {
      return;
    }

    setMediaSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const mediaItem = await uploadEntityMediaItem(entityType, entityId, formData);
      const nextMediaItems = [...mediaItems, mediaItem].sort((a, b) => a.position - b.position);
      setMediaItems(nextMediaItems);
      setPinImage(nextMediaItems[0]?.publicUrl ?? mediaItem.publicUrl);
      latestDraftRef.current = {
        ...latestDraftRef.current,
        imageUrl: nextMediaItems[0]?.publicUrl ?? mediaItem.publicUrl,
      };
    } catch (error) {
      console.error(error);
    } finally {
      setMediaSaving(false);
    }
  };

  const handleImageDelete = async () => {
    if (!entityType || !entityId || mediaSaving) {
      return;
    }

    setMediaSaving(true);
    try {
      const primaryMediaItem = mediaItems[0] ?? null;

      if (primaryMediaItem) {
        await removeEntityMediaItem(entityType, entityId, primaryMediaItem.id);
        const nextMediaItems = mediaItems.filter((item) => item.id !== primaryMediaItem.id);
        const nextImageUrl = nextMediaItems[0]?.publicUrl ?? null;
        setMediaItems(nextMediaItems);
        setPinImage(nextImageUrl);
        latestDraftRef.current = { ...latestDraftRef.current, imageUrl: nextImageUrl };
      } else {
        setPinImage(null);
        latestDraftRef.current = { ...latestDraftRef.current, imageUrl: null };
        await persistPinDetails({ imageUrl: null });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setMediaSaving(false);
    }
  };

  const handleMediaItemDelete = async (mediaItemId: string) => {
    if (!entityType || !entityId || mediaSaving) {
      return;
    }

    setMediaSaving(true);
    try {
      await removeEntityMediaItem(entityType, entityId, mediaItemId);
      const nextMediaItems = mediaItems.filter((item) => item.id !== mediaItemId);
      const nextImageUrl = nextMediaItems[0]?.publicUrl ?? null;
      setMediaItems(nextMediaItems);
      setPinImage(nextImageUrl);
      latestDraftRef.current = { ...latestDraftRef.current, imageUrl: nextImageUrl };
    } catch (error) {
      console.error(error);
    } finally {
      setMediaSaving(false);
    }
  };

  const handleAddResourceLink = async () => {
    if (!entityType || !entityId || resourceSaving) {
      return;
    }

    setResourceSaving(true);
    try {
      const nextResource = await addEntityResourceLink(entityType, entityId, {
        label: "",
        url: "",
      });
      setResourceLinks((current) => [...current, nextResource].sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error(error);
    } finally {
      setResourceSaving(false);
    }
  };

  const handleRemoveResourceLink = async (resourceId: string) => {
    if (!entityType || !entityId || resourceSaving) {
      return;
    }

    setResourceSaving(true);
    try {
      await removeEntityResourceLink(entityType, entityId, resourceId);
      setResourceLinks((current) => current.filter((resource) => resource.id !== resourceId));
    } catch (error) {
      console.error(error);
    } finally {
      setResourceSaving(false);
    }
  };

  const handleCommitResourceLink = async (
    resourceId: string,
    params: { label?: string | null; url: string }
  ) => {
    if (!entityType || !entityId || resourceSaving) {
      return;
    }

    setResourceSaving(true);
    try {
      const updated = await updateEntityResourceLink(entityType, entityId, resourceId, params);
      setResourceLinks((current) =>
        current.map((resource) => (resource.id === resourceId ? updated : resource))
      );
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setResourceSaving(false);
    }
  };

  const handleSaveStoryEntry = async ({
    storyEntryId,
    title,
    bodyMarkdown,
  }: {
    storyEntryId?: string | null;
    title?: string | null;
    bodyMarkdown: string;
  }) => {
    if (!entityType || !entityId) {
      return;
    }

    setStorySaving(true);
    try {
      const trimmedTitle = title?.trim() || null;
      const nextBodyMarkdown = bodyMarkdown;

      const nextEntry = storyEntryId
        ? await updateEntityStoryEntry(entityType, entityId, storyEntryId, {
            title: trimmedTitle,
            bodyMarkdown: nextBodyMarkdown,
          })
        : await addEntityStoryEntry(entityType, entityId, {
            title: trimmedTitle,
            bodyMarkdown: nextBodyMarkdown,
          });

      setStoryEntries((current) => {
        const exists = current.some((entry) => entry.id === nextEntry.id);
        const next = exists
          ? current.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry))
          : [...current, nextEntry];

        return [...next].sort((a, b) => a.position - b.position);
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setStorySaving(false);
    }
  };

  const handleRemoveStoryEntry = async (storyEntryId: string) => {
    if (!entityType || !entityId) {
      return;
    }

    setStorySaving(true);
    try {
      await removeEntityStoryEntry(entityType, entityId, storyEntryId);
      setStoryEntries((current) => current.filter((entry) => entry.id !== storyEntryId));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setStorySaving(false);
    }
  };

  const handleDelete = async () => {
    const targetEntityId = entityId ?? data?.id;

    if (!targetEntityId || !entityType) {
      return;
    }

    setSaving(true);
    try {
      if (entityType === "pin" && onDeletePin) {
        await onDeletePin(targetEntityId, data?.collectionId);
      } else {
        await deleteEntity(entityType, targetEntityId);
        setDeleteWarningOpen(false);
        onDataSaved?.();
        onClose();
      }
      setDeleteWarningOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRateEntity = async (value: number) => {
    const containerId = entityPayload?.metadata?.containerId;

    if (typeof containerId !== "string" || ratingSaving) {
      return;
    }

    setEntityRating(value);
    setRatingSaving(true);
    try {
      const nextValue = await updateEntityRating(containerId, value);
      setEntityRating((current) => (current === nextValue ? current : nextValue));
    } catch (error) {
      console.error(error);
    } finally {
      setRatingSaving(false);
    }
  };

  const handleUpdateWidgetBackground = async (widgetId: string, backgroundStyle: string) => {
    setEntityWidgets((current) =>
      current.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              config: {
                ...widget.config,
                chromeBackgroundStyle: backgroundStyle,
              },
            }
          : widget
      )
    );

    try {
      await updateWidgetChromeBackground(widgetId, backgroundStyle);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    setRemovingWidgetId(widgetId);

    try {
      const widget = entityWidgets.find((current) => current.id === widgetId);

      if (!widget) {
        return;
      }

      if (widget.layer === "shell") {
        await removeShellWidgetPlacement(widgetId, "shared_entity_shell");
      } else {
        if (!entityType || !entityId) {
          return;
        }

        await removeEntityWidget(entityType, entityId, widgetId);
      }

      setEntityWidgets((current) => current.filter((widget) => widget.id !== widgetId));
    } catch (error) {
      console.error(error);
    } finally {
      setRemovingWidgetId(null);
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

  const supportsDirectPinEditing = Boolean(entityType);
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
    mediaItems,
    nearbyPins,
    resourceLinks,
    storyEntries,
    imageFile,
    saving,
    storySaving,
    mediaSaving,
    deleteWarningOpen,
    entityRating,
    entityPayload,
    entityWidgets,
    pinnedEntityWidgets,
    mainEntityWidgets,
    loading,
    removingWidgetId,
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
    handleTitleChange,
    handleTitleCommit,
    handleImageUpload,
    handleImageDelete,
    handleMediaItemDelete,
    handleAddResourceLink,
    handleRemoveResourceLink,
    handleCommitResourceLink,
    handleSaveStoryEntry,
    handleRemoveStoryEntry,
    handleDelete,
    handleRemoveWidget,
    handleRateEntity,
    handleOpenNearbyPin,
    handleUpdateWidgetBackground,
    handleClose,
    setDeleteWarningOpen,
  };
};
