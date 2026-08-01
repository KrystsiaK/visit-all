"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";
import { useCallback, useMemo, useState } from "react";
import { BaseWidget, useShellRuntimeActions } from "@synarava/shell-kit";
import { usePortConsumer } from "@synarava/wiring-engine";
import { CollectionList, SelectionAura, type CollectionListItemData } from "@synarava/ui-kit";
import { EmptyCollectionsState } from "@/components/widgets/shell-widgets/collections/EmptyCollectionsState";
import { useCollections } from "@/modules/collections/CollectionsContext";
import { getLayerVisibilityFlags, hasAnySolo } from "@/modules/collections/layer-visibility";
import { exportCollection } from "@/app/actions";
import { serializeCollectionToJson } from "@/modules/collections/export-format";

export const ShellCollectionsWidget = () => {
  const {
    displayCollections,
    collectionsLoaded,
    highlightedCollectionId,
    editingCollection,
    editingCollectionId,
    itemLabel,
    layerVisibility,
    awaitingCollectionSelection,
    primaryActionLabel,
    selectionCommitPendingId,
    saving,
    onCollectionClick,
    onToggleCollectionVisibility,
    onShowOnlyCollection,
    onNameChange,
    onColorChange,
    onDone,
    onRequestDelete,
  } = useCollections();

  const collectionQuery = usePortConsumer("shell_collections", "query_in", "");
  const { registerWidgetElement, scrollWidgetToCenter } = useShellRuntimeActions();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExport = useCallback(async (id: string) => {
    if (exportingId) return;
    setExportingId(id);
    try {
      const data = await exportCollection(id);
      const json = serializeCollectionToJson(data);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = `${data.collection.name.toLowerCase().replace(/\s+/g, "-")}.json`;
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 150);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export collection. See console for details.");
    } finally {
      setExportingId(null);
    }
  }, [exportingId]);

  const handleWidgetRef = useCallback((element: HTMLDivElement | null) => {
    registerWidgetElement("shell_collections", element);
  }, [registerWidgetElement]);

  const handleScrollIntoView = useCallback(() => {
    scrollWidgetToCenter("shell_collections");
  }, [scrollWidgetToCenter]);

  const hasSolo = useMemo(() => hasAnySolo(layerVisibility), [layerVisibility]);

  const items = useMemo((): CollectionListItemData[] => {
    const normalizedQuery = collectionQuery.trim().toLowerCase();
    const filtered = normalizedQuery
      ? displayCollections.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
      : displayCollections;
    return filtered.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      itemCount: c.itemCount,
      flags: getLayerVisibilityFlags(layerVisibility, c.id),
    }));
  }, [collectionQuery, displayCollections, layerVisibility]);

  return (
    <BaseWidget
      {...WIDGET_GLASS}
      title="Collections"
      identityVisibility="settings-only"
      className="pointer-events-auto relative mb-2 flex h-[396px] shrink-0 flex-col overflow-hidden"
      contentPaddingClassName="px-0 pb-0 pt-[14px]"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <div ref={handleWidgetRef} data-shell-widget="collections" className="flex min-h-0 flex-1 flex-col">
        {awaitingCollectionSelection ? <SelectionAura /> : null}
        <div className="flex min-h-0 flex-1 flex-col" style={{ transformOrigin: "50% 0%" }}>
          <CollectionList
            items={items}
            allItemsCount={displayCollections.length}
            loaded={collectionsLoaded}
            emptyNode={<EmptyCollectionsState />}
            entityLabel={itemLabel}
            hasSolo={hasSolo}
            editingItemId={editingCollectionId}
            editingItem={editingCollection}
            highlightedItemId={highlightedCollectionId}
            awaitingSelection={awaitingCollectionSelection}
            selectionCommitPendingId={selectionCommitPendingId}
            primaryActionLabel={primaryActionLabel}
            saving={saving}
            itemLabel={itemLabel}
            onScrollIntoView={handleScrollIntoView}
            onItemClick={(id) => {
              const c = displayCollections.find((col) => col.id === id);
              if (c) onCollectionClick(c);
            }}
            onToggleVisibility={onToggleCollectionVisibility}
            onShowOnly={onShowOnlyCollection}
            onNameChange={onNameChange}
            onColorChange={onColorChange}
            onDone={onDone}
            onRequestDelete={(id) => {
              onRequestDelete(displayCollections.find((col) => col.id === id) ?? null);
            }}
            onExport={handleExport}
          />
        </div>
      </div>
    </BaseWidget>
  );
};
