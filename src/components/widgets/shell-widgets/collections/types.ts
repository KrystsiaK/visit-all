import type { Dispatch, SetStateAction } from "react";
import type { Collection, InteractionMode } from "@/app/page";
import type { LayerVisibilityState } from "@/lib/layer-visibility";

export interface UseShellCollectionsBindingParams {
  mode: InteractionMode;
  collections: Collection[];
  setCollections: Dispatch<SetStateAction<Collection[]>>;
  targetCollectionId: string;
  setTargetCollectionId: (value: string) => void;
  awaitingCollectionSelection: boolean;
  autoOpenCollectionId: string | null;
  onCollectionConfirm: (collectionId: string) => Promise<void>;
  onDataSaved: () => void;
  setMobileSidebarOpen?: (value: boolean) => void;
}

export interface CollectionsUiState {
  highlightedCollectionId: string;
  editingCollectionId: string | null;
  selectionCommitPendingId: string | null;
}

export type CollectionsUiAction =
  | { type: "sync-highlight"; collectionId: string }
  | { type: "open-editor"; collectionId: string }
  | { type: "close-editor" }
  | { type: "start-commit"; collectionId: string }
  | { type: "finalize-commit"; collectionId: string }
  | { type: "clear-target"; collectionId: string };

export interface ShellCollectionsWidgetProps {
  collections: Collection[];
  collectionsLoaded: boolean;
  highlightedCollectionId: string;
  editingCollection: Collection | null;
  editingCollectionId: string | null;
  itemLabel: string;
  layerVisibility: LayerVisibilityState;
  awaitingCollectionSelection: boolean;
  primaryActionLabel: string;
  selectionCommitPendingId: string | null;
  saving: boolean;
  onCollectionClick: (collection: Collection) => void;
  onToggleCollectionVisibility: (collectionId: string) => void;
  onShowOnlyCollection: (collectionId: string) => void;
  onCollectionNameChange: (value: string) => void;
  onCollectionColorChange: (value: string) => void;
  onCollectionDone: (collectionId: string) => Promise<void>;
  onRequestDeleteCollection: (collection: Collection) => void;
}

export interface CollectionEditSectionProps {
  collection: Collection;
  editingCollection: Collection | null;
  saving: boolean;
  primaryActionLabel: string;
  onCollectionColorChange: (value: string) => void;
  onCollectionDone: (collectionId: string) => Promise<void>;
  onRequestDeleteCollection: (collection: Collection) => void;
}

export interface CollectionCardProps {
  collection: Collection;
  editingCollection: Collection | null;
  highlightedCollectionId: string;
  editingCollectionId: string | null;
  itemLabel: string;
  layerVisibility: LayerVisibilityState;
  awaitingCollectionSelection: boolean;
  primaryActionLabel: string;
  selectionCommitPendingId: string | null;
  saving: boolean;
  onCollectionClick: (collection: Collection) => void;
  onToggleCollectionVisibility: (collectionId: string) => void;
  onShowOnlyCollection: (collectionId: string) => void;
  onCollectionNameChange: (value: string) => void;
  onCollectionColorChange: (value: string) => void;
  onCollectionDone: (collectionId: string) => Promise<void>;
  onRequestDeleteCollection: (collection: Collection) => void;
}
