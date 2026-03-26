import type { CollectionsUiAction, CollectionsUiState } from "@/components/widgets/shell-widgets/collections/types";

export const collectionsUiReducer = (state: CollectionsUiState, action: CollectionsUiAction): CollectionsUiState => {
  switch (action.type) {
    case "sync-highlight":
      if (state.editingCollectionId || state.selectionCommitPendingId) {
        return state;
      }
      return {
        ...state,
        highlightedCollectionId: action.collectionId,
      };
    case "open-editor":
      return {
        highlightedCollectionId: action.collectionId,
        editingCollectionId: action.collectionId,
        selectionCommitPendingId: null,
      };
    case "close-editor":
      return {
        ...state,
        editingCollectionId: null,
      };
    case "start-commit":
      return {
        ...state,
        editingCollectionId: null,
        selectionCommitPendingId: action.collectionId,
      };
    case "finalize-commit":
      return {
        highlightedCollectionId: action.collectionId,
        editingCollectionId: null,
        selectionCommitPendingId: null,
      };
    case "clear-target":
      return {
        highlightedCollectionId: state.highlightedCollectionId === action.collectionId ? "" : state.highlightedCollectionId,
        editingCollectionId: state.editingCollectionId === action.collectionId ? null : state.editingCollectionId,
        selectionCommitPendingId: state.selectionCommitPendingId === action.collectionId ? null : state.selectionCommitPendingId,
      };
    default:
      return state;
  }
};
