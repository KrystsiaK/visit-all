"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { deleteCollection, updateCollection } from "@/app/actions";
import type { Collection } from "@/app/page";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { collectionsUiReducer } from "@/components/widgets/shell-widgets/collections/reducer";
import type { UseShellCollectionsBindingParams } from "@/components/widgets/shell-widgets/collections/types";
import { getSelectionActionLabel, isCollectionDirty, moveCollectionToFront } from "@/components/widgets/shell-widgets/collections/utils";

const MOVE_TO_FRONT_DELAY_MS = 1000;

export const useShellCollectionsBinding = ({
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
}: UseShellCollectionsBindingParams) => {
  const [saving, setSaving] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionPendingDelete, setCollectionPendingDelete] = useState<Collection | null>(null);
  const [frozenCollections, setFrozenCollections] = useState<Collection[] | null>(null);
  const [uiState, dispatchUi] = useReducer(collectionsUiReducer, {
    highlightedCollectionId: targetCollectionId,
    editingCollectionId: null,
    selectionCommitPendingId: null,
  });
  const editingBaselineRef = useRef<Collection | null>(null);
  const commitTimeoutRef = useRef<number | null>(null);
  const selectionActionLabel = getSelectionActionLabel(mode);

  const debouncedCollectionUpdate = useDebouncedCallback(async (id: string, name: string, color: string, icon: string) => {
    setSaving(true);
    try {
      await updateCollection(id, name, color, icon);
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
    if (!targetCollection) {
      return;
    }

    setEditingCollection(targetCollection);
    editingBaselineRef.current = targetCollection;
    dispatchUi({ type: "open-editor", collectionId: targetCollection.id });
  }, [autoOpenCollectionId, collections]);

  useEffect(() => {
    if (editingCollection && !collections.some((collection) => collection.id === editingCollection.id)) {
      setEditingCollection(null);
      dispatchUi({ type: "close-editor" });
    }
  }, [editingCollection, collections]);

  useEffect(() => {
    dispatchUi({ type: "sync-highlight", collectionId: targetCollectionId });
  }, [targetCollectionId]);

  useEffect(() => () => {
    if (commitTimeoutRef.current !== null) {
      window.clearTimeout(commitTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (uiState.selectionCommitPendingId === null && frozenCollections !== null) {
      setFrozenCollections(null);
    }
  }, [frozenCollections, uiState.selectionCommitPendingId]);

  const isEditingDirty = isCollectionDirty(editingCollection, editingBaselineRef.current);

  const primaryActionLabel = isEditingDirty
    ? awaitingCollectionSelection
      ? `Save & ${selectionActionLabel}`
      : "Save"
    : awaitingCollectionSelection
      ? selectionActionLabel
      : "Close";

  const scheduleCommitFinalize = (collectionId: string, syncTarget = false) => {
    if (commitTimeoutRef.current !== null) {
      window.clearTimeout(commitTimeoutRef.current);
    }

    commitTimeoutRef.current = window.setTimeout(() => {
      if (syncTarget) {
        setTargetCollectionId(collectionId);
      }
      setCollections((currentCollections) => moveCollectionToFront(currentCollections, collectionId));
      dispatchUi({ type: "finalize-commit", collectionId });
      setFrozenCollections(null);
      commitTimeoutRef.current = null;
    }, MOVE_TO_FRONT_DELAY_MS);
  };

  const handleEditCollectionChange = (field: "name" | "color" | "icon", value: string) => {
    if (!editingCollection) {
      return;
    }

    const updated = { ...editingCollection, [field]: value };
    setEditingCollection(updated);
    setCollections((currentCollections) =>
      currentCollections.map((collection) =>
        collection.id === updated.id ? { ...collection, [field]: value } : collection
      )
    );
    debouncedCollectionUpdate(updated.id, updated.name, updated.color, updated.icon);
  };

  const openCollectionEditor = (collection: Collection) => {
    setEditingCollection(collection);
    editingBaselineRef.current = collection;
    dispatchUi({ type: "open-editor", collectionId: collection.id });
  };

  const handleCollectionCardClick = async (collection: Collection) => {
    if (editingCollection?.id === collection.id) {
      return;
    }

    if (!awaitingCollectionSelection) {
      openCollectionEditor(collection);
      return;
    }

    setEditingCollection(null);
    editingBaselineRef.current = null;
    setFrozenCollections(collections);
    dispatchUi({ type: "start-commit", collectionId: collection.id });
    scheduleCommitFinalize(collection.id, true);
    await onCollectionConfirm(collection.id);
    setMobileSidebarOpen?.(false);
  };

  const handleCollectionDone = async (collectionId: string) => {
    const didChange = isCollectionDirty(editingCollection, editingBaselineRef.current);

    setEditingCollection(null);
    editingBaselineRef.current = null;

    if (!awaitingCollectionSelection) {
      dispatchUi(didChange ? { type: "start-commit", collectionId } : { type: "close-editor" });
      if (didChange) {
        scheduleCommitFinalize(collectionId);
      }
      return;
    }

    setFrozenCollections(collections);
    dispatchUi({ type: "start-commit", collectionId });
    scheduleCommitFinalize(collectionId, true);
    void onCollectionConfirm(collectionId);
    setMobileSidebarOpen?.(false);
  };

  const handleDeleteCollection = async (id: string) => {
    setSaving(true);
    try {
      await deleteCollection(id);
      if (targetCollectionId === id) {
        setTargetCollectionId("");
      }
      setEditingCollection(null);
      dispatchUi({ type: "clear-target", collectionId: id });
      setCollectionPendingDelete(null);
      setCollections((currentCollections) => currentCollections.filter((collection) => collection.id !== id));
      onDataSaved();
    } catch {
      alert("Unable to delete collection.");
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    highlightedCollectionId: uiState.highlightedCollectionId,
    editingCollectionId: uiState.editingCollectionId,
    selectionCommitPendingId: uiState.selectionCommitPendingId,
    displayCollections: frozenCollections ?? collections,
    editingCollection,
    isEditingDirty,
    primaryActionLabel,
    setEditingCollection,
    openCollectionEditor,
    collectionPendingDelete,
    setCollectionPendingDelete,
    handleEditCollectionChange,
    handleCollectionCardClick,
    handleCollectionDone,
    handleDeleteCollection,
  };
};
