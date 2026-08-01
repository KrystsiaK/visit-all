"use client";

import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { createCollection, importCollection } from "@/app/actions";
import type { Collection, InteractionMode } from "@/modules/collections/types";
import type { CollectionExportData } from "@/modules/collections/export-format";
import type { LayerVisibilityState } from "@/modules/collections/layer-visibility";
import { useShellCollectionsBinding } from "@/components/widgets/shell-widgets/collections";

export interface CollectionsContextValue {
  collections: Collection[];
  collectionsLoaded: boolean;
  displayCollections: Collection[];
  highlightedCollectionId: string;
  editingCollectionId: string | null;
  editingCollection: Collection | null;
  primaryActionLabel: string;
  selectionCommitPendingId: string | null;
  saving: boolean;
  awaitingCollectionSelection: boolean;
  layerVisibility: LayerVisibilityState;
  itemLabel: string;
  collectionPendingDelete: Collection | null;
  onCollectionClick: (collection: Collection) => void;
  onToggleCollectionVisibility: (collectionId: string) => void;
  onShowOnlyCollection: (collectionId: string) => void;
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onDone: (collectionId: string) => Promise<void>;
  onRequestDelete: (collection: Collection | null) => void;
  onCreateCollection: () => void;
  onConfirmDelete: (id: string) => void;
  onImportCollection: (data: CollectionExportData) => Promise<void>;
}

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

/** Low-level provider for isolated adapters such as Storybook and the widget showroom. */
export const CollectionsStateProvider = CollectionsContext.Provider;

export function useCollections(): CollectionsContextValue {
  const ctx = useContext(CollectionsContext);
  if (!ctx) throw new Error("useCollections must be used within CollectionsProvider");
  return ctx;
}

export function useOptionalCollections(): CollectionsContextValue | null {
  return useContext(CollectionsContext);
}

export interface CollectionsProviderProps {
  children: ReactNode;
  collections: Collection[];
  setCollections: Dispatch<SetStateAction<Collection[]>>;
  collectionsLoaded: boolean;
  targetCollectionId: string;
  setTargetCollectionId: (val: string) => void;
  mode: InteractionMode;
  pendingPin: { lng: number; lat: number } | null;
  traceDraftFinalized: boolean;
  areaDraftFinalized: boolean;
  autoOpenCollectionId: string | null;
  onCollectionConfirm: (collectionId: string) => Promise<void>;
  onDataSaved: () => void;
  setMobileSidebarOpen: (val: boolean) => void;
  layerVisibility: LayerVisibilityState;
  onToggleCollectionVisibility: (collectionId: string) => void;
  onShowOnlyCollection: (collectionId: string) => void;
}

export function CollectionsProvider({
  children,
  collections,
  setCollections,
  collectionsLoaded,
  targetCollectionId,
  setTargetCollectionId,
  mode,
  pendingPin,
  traceDraftFinalized,
  areaDraftFinalized,
  autoOpenCollectionId,
  onCollectionConfirm,
  onDataSaved,
  setMobileSidebarOpen,
  layerVisibility,
  onToggleCollectionVisibility,
  onShowOnlyCollection,
}: CollectionsProviderProps) {
  const [creatingCollection, setCreatingCollection] = useState(false);

  const awaitingCollectionSelection =
    (mode === "pin" && !!pendingPin) ||
    (mode === "trace" && traceDraftFinalized) ||
    (mode === "area" && areaDraftFinalized);

  const itemLabel =
    mode === "trace" || mode === "editTrace"
      ? "path"
      : mode === "area" || mode === "editArea"
        ? "zone"
        : "pin";

  const {
    saving: bindingSaving,
    displayCollections,
    highlightedCollectionId,
    editingCollectionId,
    editingCollection,
    primaryActionLabel,
    selectionCommitPendingId,
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
    awaitingCollectionSelection,
    autoOpenCollectionId,
    onCollectionConfirm,
    onDataSaved,
    setMobileSidebarOpen,
  });

  const handleCreateCollection = async () => {
    setCreatingCollection(true);
    try {
      const collType =
        mode === "trace" || mode === "editTrace"
          ? "trace"
          : mode === "area" || mode === "editArea"
            ? "area"
            : "pin";
      const newCol = await createCollection("UNTITLED LAYER", "#0000ff", "!", collType);
      setCollections((current) => [newCol, ...current]);
      openCollectionEditor(newCol);
      setTargetCollectionId(newCol.id);
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleImportCollection = async (data: CollectionExportData) => {
    setCreatingCollection(true);
    try {
      const newCol = await importCollection(data);
      setCollections((current) => [newCol, ...current]);
      onDataSaved();
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingCollection(false);
    }
  };

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        collectionsLoaded,
        displayCollections,
        highlightedCollectionId,
        editingCollectionId,
        editingCollection,
        primaryActionLabel,
        selectionCommitPendingId,
        saving: bindingSaving || creatingCollection,
        awaitingCollectionSelection,
        layerVisibility,
        itemLabel,
        collectionPendingDelete,
        onCollectionClick: handleCollectionCardClick,
        onToggleCollectionVisibility,
        onShowOnlyCollection,
        onNameChange: (value) => handleEditCollectionChange("name", value),
        onColorChange: (value) => handleEditCollectionChange("color", value),
        onDone: handleCollectionDone,
        onRequestDelete: setCollectionPendingDelete,
        onCreateCollection: () => void handleCreateCollection(),
        onConfirmDelete: (id) => void handleDeleteCollection(id),
        onImportCollection: handleImportCollection,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}
