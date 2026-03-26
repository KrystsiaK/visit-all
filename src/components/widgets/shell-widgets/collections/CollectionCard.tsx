import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Eye, EyeOff, Focus } from "lucide-react";
import { getLayerVisibilityFlags, hasAnySolo } from "@/lib/layer-visibility";
import { Tooltip } from "@/components/ui/Tooltip";
import { useShellRuntimeActions, useShellRuntimeValue } from "@/components/shells/ShellRuntimeProvider";
import { AnimatedCount } from "@/components/widgets/shell-widgets/AnimatedCount";
import { CollectionEditSection } from "@/components/widgets/shell-widgets/collections/CollectionEditSection";
import type { CollectionCardProps } from "@/components/widgets/shell-widgets/collections/types";

export const CollectionCard = ({
  collection,
  editingCollection,
  highlightedCollectionId,
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
}: CollectionCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const runtimeHighlightedCollectionId = useShellRuntimeValue("highlightedCollectionId", highlightedCollectionId);
  const runtimeEditingCollectionId = useShellRuntimeValue<string | null>("editingCollectionId", editingCollectionId);
  const { patchState, scrollWidgetToCenter } = useShellRuntimeActions();
  const isEditing = runtimeEditingCollectionId === collection.id;
  const isSelectionCommitPending = selectionCommitPendingId === collection.id;
  const selectionVisualsLocked = awaitingCollectionSelection || selectionCommitPendingId !== null;
  const flags = getLayerVisibilityFlags(layerVisibility, collection.id);
  const hasSolo = hasAnySolo(layerVisibility);
  const focusTooltipLabel = flags.solo
    ? "Stop Showing Only This Collection"
    : hasSolo
      ? "Add This Collection To Show Only"
      : "Show Only This Collection";

  useEffect(() => {
    if (!isEditing || isSelectionCommitPending) {
      return;
    }

    const collectionsScrollRegion = cardRef.current?.closest("[data-collections-scroll-region='true']") as HTMLElement | null;

    scrollWidgetToCenter("shell_collections");

    if (collectionsScrollRegion && cardRef.current) {
      const regionRect = collectionsScrollRegion.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      const nextRegionTop = collectionsScrollRegion.scrollTop + cardRect.top - regionRect.top - 8;

      collectionsScrollRegion.scrollTo({
        top: Math.max(0, nextRegionTop),
        behavior: "smooth",
      });
    }

    window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.select();
    }, 40);
  }, [isEditing, isSelectionCommitPending, scrollWidgetToCenter]);

  return (
    <div
      ref={cardRef}
      data-testid="collection-card"
      onClick={() => {
        patchState(
          awaitingCollectionSelection
            ? { editingCollectionId: null }
            : {
                highlightedCollectionId: collection.id,
                editingCollectionId: collection.id,
              }
        );
        onCollectionClick(collection);
      }}
      className={`flex cursor-pointer overflow-hidden rounded-xl ${
        isSelectionCommitPending || isEditing
          ? "flex-col border border-black/10 bg-white"
          : runtimeHighlightedCollectionId === collection.id
            ? "flex-col border border-black/10 bg-white"
            : "flex-col border border-black/5 bg-white hover:bg-white"
      }`}
      style={{
        minHeight: isEditing && !isSelectionCommitPending ? 176 : 66,
        opacity: selectionVisualsLocked
          ? isSelectionCommitPending || isEditing || runtimeHighlightedCollectionId === collection.id
            ? 0.86
            : 0.72
          : 1,
      }}
    >
      <div className="flex min-h-[66px] items-center gap-3 px-[13px] py-[13px]">
        <div
          className="h-10 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: isEditing ? (editingCollection?.color || collection.color) : collection.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingCollection?.name ?? ""}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onCollectionNameChange(event.target.value)}
                  className="m-0 w-full bg-transparent border-none p-0 text-[14px] leading-5 font-medium text-[#171717] outline-none placeholder-neutral-300"
                  placeholder="Collection name..."
                />
              ) : (
                <h4 className="truncate pr-2 text-[14px] font-medium leading-5 text-[#171717]">{collection.name}</h4>
              )}
              <p className="mt-0.5 text-[12px] leading-4 text-[#737373]">
                <AnimatedCount value={collection.itemCount} /> {itemLabel}{collection.itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip label={flags.muted ? "Show Collection" : "Hide Collection"}>
                <button
                  data-testid="collection-mute-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleCollectionVisibility(collection.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-black/4 hover:text-neutral-600"
                  aria-pressed={flags.muted}
                >
                  {flags.muted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Tooltip>
              <Tooltip label={focusTooltipLabel}>
                <button
                  data-testid="collection-solo-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onShowOnlyCollection(collection.id);
                  }}
                  className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                    flags.solo ? "bg-black/4 text-neutral-700" : "text-neutral-400 hover:bg-black/4 hover:text-neutral-600"
                  }`}
                  aria-pressed={flags.solo}
                >
                  <Focus className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isEditing && !isSelectionCommitPending ? (
          awaitingCollectionSelection ? (
            <div className="overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <CollectionEditSection
                collection={collection}
                editingCollection={editingCollection}
                saving={saving}
                primaryActionLabel={primaryActionLabel}
                onCollectionColorChange={onCollectionColorChange}
                onCollectionDone={onCollectionDone}
                onRequestDeleteCollection={onRequestDeleteCollection}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                height: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
                opacity: { duration: 0.14, ease: "easeOut" },
              }}
              className="overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <CollectionEditSection
                collection={collection}
                editingCollection={editingCollection}
                saving={saving}
                primaryActionLabel={primaryActionLabel}
                onCollectionColorChange={onCollectionColorChange}
                onCollectionDone={onCollectionDone}
                onRequestDeleteCollection={onRequestDeleteCollection}
              />
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
    </div>
  );
};
