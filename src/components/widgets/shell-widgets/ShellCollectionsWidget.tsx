import { useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BaseWidget, useShellRuntimeActions, useShellRuntimeValue } from "@synarava/shell-kit";
import { CollectionCard } from "@/components/widgets/shell-widgets/collections/CollectionCard";
import { SelectionAura } from "@/components/widgets/shell-widgets/collections/SelectionAura";
import { EmptyCollectionsState, EmptySearchState, LoadingRows } from "@/components/widgets/shell-widgets/collections/CollectionStates";
import type { ShellCollectionsWidgetProps } from "@/components/widgets/shell-widgets/collections/types";

export const ShellCollectionsWidget = ({
  collections,
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
  onCollectionNameChange,
  onCollectionColorChange,
  onCollectionDone,
  onRequestDeleteCollection,
}: ShellCollectionsWidgetProps) => {
  const collectionQuery = useShellRuntimeValue("collectionQuery", "");
  const { registerWidgetElement } = useShellRuntimeActions();

  const handleWidgetRef = useCallback((element: HTMLDivElement | null) => {
    registerWidgetElement("shell_collections", element);
  }, [registerWidgetElement]);

  const filteredCollections = useMemo(() => {
    const normalizedQuery = collectionQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return collections;
    }

    return collections.filter((collection) =>
      collection.name.toLowerCase().includes(normalizedQuery)
    );
  }, [collectionQuery, collections]);

  return (
    <BaseWidget
      title="Collections"
      identityVisibility="settings-only"
      className="pointer-events-auto relative mb-2 flex h-[396px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white/70 shadow-[0px_10px_36px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
      contentPaddingClassName="px-0 pb-0 pt-[18px]"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <motion.div
        ref={handleWidgetRef}
        data-shell-widget="collections"
        className="flex min-h-0 flex-1 flex-col"
        layout
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {awaitingCollectionSelection ? <SelectionAura /> : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={itemLabel}
            initial={{ opacity: 0, y: 10, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.992, filter: "blur(6px)" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col"
            style={{ transformOrigin: "50% 0%" }}
            layout
          >
          {!collectionsLoaded && collections.length === 0 ? (
            <LoadingRows />
          ) : collections.length === 0 ? (
            <EmptyCollectionsState />
          ) : filteredCollections.length === 0 ? (
            <EmptySearchState />
          ) : (
            <div
              data-collections-scroll-region="true"
              className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-0"
            >
              <div className="flex min-h-full flex-col gap-2 px-0 py-0.5">
                <AnimatePresence initial={false}>
                  {filteredCollections.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      editingCollection={editingCollection}
                      highlightedCollectionId={highlightedCollectionId}
                      editingCollectionId={editingCollectionId}
                      itemLabel={itemLabel}
                      layerVisibility={layerVisibility}
                      awaitingCollectionSelection={awaitingCollectionSelection}
                      primaryActionLabel={primaryActionLabel}
                      selectionCommitPendingId={selectionCommitPendingId}
                      saving={saving}
                      onCollectionClick={onCollectionClick}
                      onToggleCollectionVisibility={onToggleCollectionVisibility}
                      onShowOnlyCollection={onShowOnlyCollection}
                      onCollectionNameChange={onCollectionNameChange}
                      onCollectionColorChange={onCollectionColorChange}
                      onCollectionDone={onCollectionDone}
                      onRequestDeleteCollection={onRequestDeleteCollection}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </BaseWidget>
  );
};
