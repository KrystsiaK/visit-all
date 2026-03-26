import { describe, expect, it } from "vitest";
import type { CollectionsUiState } from "@/components/widgets/shell-widgets/collections/types";
import { collectionsUiReducer } from "@/components/widgets/shell-widgets/collections/reducer";

const initialState = (overrides: Partial<CollectionsUiState> = {}): CollectionsUiState => ({
  highlightedCollectionId: "c1",
  editingCollectionId: null,
  selectionCommitPendingId: null,
  ...overrides,
});

describe("collectionsUiReducer", () => {
  it("syncs highlight when widget is idle", () => {
    expect(
      collectionsUiReducer(initialState(), { type: "sync-highlight", collectionId: "c2" })
    ).toEqual(initialState({ highlightedCollectionId: "c2" }));
  });

  it("does not sync highlight while editing", () => {
    const state = initialState({ editingCollectionId: "c1" });

    expect(
      collectionsUiReducer(state, { type: "sync-highlight", collectionId: "c2" })
    ).toBe(state);
  });

  it("does not sync highlight while selection commit is pending", () => {
    const state = initialState({ selectionCommitPendingId: "c1" });

    expect(
      collectionsUiReducer(state, { type: "sync-highlight", collectionId: "c2" })
    ).toBe(state);
  });

  it("opens the editor and clears pending selection", () => {
    expect(
      collectionsUiReducer(initialState({ selectionCommitPendingId: "c3" }), {
        type: "open-editor",
        collectionId: "c2",
      })
    ).toEqual({
      highlightedCollectionId: "c2",
      editingCollectionId: "c2",
      selectionCommitPendingId: null,
    });
  });

  it("closes the editor without touching highlight", () => {
    expect(
      collectionsUiReducer(initialState({ editingCollectionId: "c2" }), { type: "close-editor" })
    ).toEqual({
      highlightedCollectionId: "c1",
      editingCollectionId: null,
      selectionCommitPendingId: null,
    });
  });

  it("starts a commit and clears editing state", () => {
    expect(
      collectionsUiReducer(initialState({ editingCollectionId: "c2" }), {
        type: "start-commit",
        collectionId: "c2",
      })
    ).toEqual({
      highlightedCollectionId: "c1",
      editingCollectionId: null,
      selectionCommitPendingId: "c2",
    });
  });

  it("finalizes a commit into a stable highlighted state", () => {
    expect(
      collectionsUiReducer(initialState({ selectionCommitPendingId: "c2" }), {
        type: "finalize-commit",
        collectionId: "c2",
      })
    ).toEqual({
      highlightedCollectionId: "c2",
      editingCollectionId: null,
      selectionCommitPendingId: null,
    });
  });

  it("clears all references to a removed target collection", () => {
    expect(
      collectionsUiReducer(
        {
          highlightedCollectionId: "c2",
          editingCollectionId: "c2",
          selectionCommitPendingId: "c2",
        },
        { type: "clear-target", collectionId: "c2" }
      )
    ).toEqual({
      highlightedCollectionId: "",
      editingCollectionId: null,
      selectionCommitPendingId: null,
    });
  });

  it("preserves unrelated ids when clearing a different target", () => {
    expect(
      collectionsUiReducer(
        {
          highlightedCollectionId: "c1",
          editingCollectionId: "c2",
          selectionCommitPendingId: "c3",
        },
        { type: "clear-target", collectionId: "c4" }
      )
    ).toEqual({
      highlightedCollectionId: "c1",
      editingCollectionId: "c2",
      selectionCommitPendingId: "c3",
    });
  });
});
