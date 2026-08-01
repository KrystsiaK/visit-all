"use client";

import { createContext, useContext, type ChangeEvent, type PointerEvent, type ReactNode } from "react";
import type {
  EntityMediaItemRecord,
  EntityNearbyPinRecord,
  EntityResourceLinkRecord,
  EntityStoryEntryRecord,
} from "@/app/actions";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import type { EntityWidgetBindingsResult } from "@/modules/entity/hooks/useEntityWidgetBindings";

// ── EntityMetaContext ───────────────────────────────────────────────────────
// Stable: only changes when the entity itself changes (id / type).
export interface EntityMetaContextValue {
  normalizedEntity: WidgetEntityPayload;
  entityWidgets: WidgetInstanceRecord[];
  pinnedEntityWidgets: WidgetInstanceRecord[];
  mainEntityWidgets: WidgetInstanceRecord[];
  loading: boolean;
  supportsDirectPinEditing: boolean;
  entityInteractionsUnavailable: boolean;
  draggedWidgetId: string | null;
  handleSlotPointerDown: (event: PointerEvent<HTMLDivElement>, widgetId: string) => void;
}

const EntityMetaContext = createContext<EntityMetaContextValue | null>(null);

export function useEntityMeta(): EntityMetaContextValue {
  const ctx = useContext(EntityMetaContext);
  if (!ctx) throw new Error("useEntityMeta must be inside EntityProvider");
  return ctx;
}

// ── EntityDataContext ───────────────────────────────────────────────────────
// Changes when the user edits content (title keystroke, media upload, etc.).
export interface EntityDataContextValue {
  entityTitle: string;
  pinNote: string;
  pinImage: string | null;
  imageFile: File | null;
  mediaItems: EntityMediaItemRecord[];
  nearbyPins: EntityNearbyPinRecord[];
  resourceLinks: EntityResourceLinkRecord[];
  storyEntries: EntityStoryEntryRecord[];
  entityRating: number | null;
}

const EntityDataContext = createContext<EntityDataContextValue | null>(null);

export function useEntityData(): EntityDataContextValue {
  const ctx = useContext(EntityDataContext);
  if (!ctx) throw new Error("useEntityData must be inside EntityProvider");
  return ctx;
}

// ── EntityWriteContext ──────────────────────────────────────────────────────
// Changes per save operation — isolated so save-spinners don't re-render
// unrelated widgets (gallery, stories, etc.).
export interface EntityWriteContextValue {
  saving: boolean;
  storySaving: boolean;
  mediaSaving: boolean;
  removingWidgetId: string | null;
  deleteWarningOpen: boolean;
}

const EntityWriteContext = createContext<EntityWriteContextValue | null>(null);

export function useEntityWriteState(): EntityWriteContextValue {
  const ctx = useContext(EntityWriteContext);
  if (!ctx) throw new Error("useEntityWriteState must be inside EntityProvider");
  return ctx;
}

// ── EntityActionsContext ────────────────────────────────────────────────────
// Stable: all handlers are useCallback'd in useEntityWidgetBindings.
// Consumers NEVER re-render because of this context alone.
export interface EntityActionsContextValue {
  handleNoteChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleTitleChange: (value: string) => void;
  handleTitleCommit: () => Promise<void>;
  handleImageUpload: (file: File) => Promise<void>;
  handleImageDelete: () => Promise<void>;
  handleMediaItemDelete: (mediaItemId: string) => Promise<void>;
  handleAddResourceLink: () => Promise<void>;
  handleRemoveResourceLink: (resourceId: string) => Promise<void>;
  handleCommitResourceLink: (resourceId: string, params: { label?: string | null; url: string }) => Promise<void>;
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

const EntityActionsContext = createContext<EntityActionsContextValue | null>(null);

export function useEntityActions(): EntityActionsContextValue {
  const ctx = useContext(EntityActionsContext);
  if (!ctx) throw new Error("useEntityActions must be inside EntityProvider");
  return ctx;
}

// ── CurrentWidgetContext ────────────────────────────────────────────────────
// Set per-slot by the shell; lets widgets read their own WidgetInstanceRecord
// without prop drilling.
const CurrentWidgetContext = createContext<WidgetInstanceRecord | null>(null);

export function useCurrentWidget(): WidgetInstanceRecord | null {
  return useContext(CurrentWidgetContext);
}

export const CurrentWidgetProvider = CurrentWidgetContext.Provider;

// ── EntityProvider ──────────────────────────────────────────────────────────
type EntityProviderProps = {
  children: ReactNode;
} & EntityWidgetBindingsResult;

export function EntityProvider({ children, ...b }: EntityProviderProps) {
  return (
    <EntityMetaContext.Provider
      value={{
        normalizedEntity: b.normalizedEntity,
        entityWidgets: b.entityWidgets,
        pinnedEntityWidgets: b.pinnedEntityWidgets,
        mainEntityWidgets: b.mainEntityWidgets,
        loading: b.loading,
        supportsDirectPinEditing: b.supportsDirectPinEditing,
        entityInteractionsUnavailable: b.entityInteractionsUnavailable,
        draggedWidgetId: b.draggedWidgetId,
        handleSlotPointerDown: b.handleSlotPointerDown,
      }}
    >
      <EntityDataContext.Provider
        value={{
          entityTitle: b.entityTitle,
          pinNote: b.pinNote,
          pinImage: b.pinImage,
          imageFile: b.imageFile,
          mediaItems: b.mediaItems,
          nearbyPins: b.nearbyPins,
          resourceLinks: b.resourceLinks,
          storyEntries: b.storyEntries,
          entityRating: b.entityRating,
        }}
      >
        <EntityWriteContext.Provider
          value={{
            saving: b.saving,
            storySaving: b.storySaving,
            mediaSaving: b.mediaSaving,
            removingWidgetId: b.removingWidgetId,
            deleteWarningOpen: b.deleteWarningOpen,
          }}
        >
          <EntityActionsContext.Provider
            value={{
              handleNoteChange: b.handleNoteChange,
              handleTitleChange: b.handleTitleChange,
              handleTitleCommit: b.handleTitleCommit,
              handleImageUpload: b.handleImageUpload,
              handleImageDelete: b.handleImageDelete,
              handleMediaItemDelete: b.handleMediaItemDelete,
              handleAddResourceLink: b.handleAddResourceLink,
              handleRemoveResourceLink: b.handleRemoveResourceLink,
              handleCommitResourceLink: b.handleCommitResourceLink,
              handleSaveStoryEntry: b.handleSaveStoryEntry,
              handleRemoveStoryEntry: b.handleRemoveStoryEntry,
              handleDelete: b.handleDelete,
              handleRemoveWidget: b.handleRemoveWidget,
              handleRateEntity: b.handleRateEntity,
              handleOpenNearbyPin: b.handleOpenNearbyPin,
              handleUpdateWidgetBackground: b.handleUpdateWidgetBackground,
              handleClose: b.handleClose,
              setDeleteWarningOpen: b.setDeleteWarningOpen,
            }}
          >
            {children}
          </EntityActionsContext.Provider>
        </EntityWriteContext.Provider>
      </EntityDataContext.Provider>
    </EntityMetaContext.Provider>
  );
}
