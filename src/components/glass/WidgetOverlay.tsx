import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WidgetEntityType, WidgetInstanceRecord } from "@/lib/widgets";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { RightEntityShell } from "@/components/shells/RightEntityShell";
import { ShellSlot, useOptionalShellRuntimeActions } from "@synarava/shell-kit";
import { EntityDeleteDialog } from "@/components/widgets/entity-widgets/EntityDeleteDialog";
import { EntityOverlayEmptyState, EntityOverlaySkeletonCard } from "@/components/widgets/entity-widgets/EntityOverlayStates";
import { renderEntityWidget } from "@/components/widgets/entity-widgets/renderEntityWidget";
import { useEntityWidgetBindings } from "@/components/widgets/entity-widgets/useEntityWidgetBindings";

interface WidgetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSaved?: () => void;
  refreshTrigger?: number;
  onDeletePin?: (pinId: string, collectionId?: string) => Promise<void>;
  onOpenNearbyPin?: (nearbyPin: import("@/app/actions").EntityNearbyPinRecord) => void;
  entityType?: WidgetEntityType;
  entityId?: string;
  data?: {
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
  };
}

const heavyWidgetHeightByComponentKey: Record<string, number> = {
  entity_gallery: 320,
  entity_stories: 340,
  entity_resources: 300,
  entity_nearby_pins: 280,
};

const DeferredEntityWidgetSlot = ({
  render,
  estimatedHeight,
  eager = false,
}: {
  render: () => ReactNode;
  estimatedHeight: number;
  eager?: boolean;
}) => {
  const [mounted, setMounted] = useState(eager);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shellRuntimeActions = useOptionalShellRuntimeActions();

  useEffect(() => {
    if (mounted || eager || !containerRef.current) {
      return;
    }

    const shellScrollContainer = shellRuntimeActions?.getScrollContainer() ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      {
        root: shellScrollContainer,
        rootMargin: "280px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [eager, mounted, shellRuntimeActions]);

  return (
    <div
      ref={containerRef}
      style={{
        contentVisibility: mounted ? "visible" : "auto",
        containIntrinsicSize: `${estimatedHeight}px`,
      }}
    >
      {mounted ? (
        render()
      ) : (
        <div
          className="rounded-[28px] border border-black/8 bg-white/45 shadow-[0px_8px_28px_rgba(0,0,0,0.05)]"
          style={{ minHeight: estimatedHeight }}
        />
      )}
    </div>
  );
};

export function WidgetOverlay({
  isOpen,
  onClose,
  onDataSaved,
  refreshTrigger,
  onDeletePin,
  onOpenNearbyPin,
  entityType,
  entityId,
  data,
}: WidgetOverlayProps) {
  const {
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
    removingWidgetId,
    pinnedEntityWidgets,
    mainEntityWidgets,
    loading,
    draggedWidgetId,
    dropTarget,
    activeData,
    normalizedEntity,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleTitleChange,
    handleTitleCommit,
    handleNoteChange,
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
  } = useEntityWidgetBindings({
    isOpen,
    refreshTrigger,
    entityType,
    entityId,
    data,
    onDataSaved,
    onClose,
    onDeletePin,
    onOpenNearbyPin,
  });

  if (!data && !normalizedEntity.id) return null;

  const resolvedPinnedEntityWidgets =
    pinnedEntityWidgets.length > 0
      ? pinnedEntityWidgets
      : mainEntityWidgets.filter((widget) => widget.componentKey === "entity_info");

  const resolvedMainEntityWidgets = mainEntityWidgets.filter(
    (widget) => !resolvedPinnedEntityWidgets.some((pinnedWidget) => pinnedWidget.id === widget.id)
  );

  const renderWidget = (
    widget: WidgetInstanceRecord,
    reorderable: boolean,
    presentation: "default" | "pinned" = "default"
  ) => {
    const content = renderEntityWidget({
      widget,
      entity: normalizedEntity,
      presentation,
      bindings: {
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
        supportsDirectPinEditing: entityType === "pin" || !entityType,
        widgetInteractionsDeferred,
        entityRating,
        removingWidgetId,
        handleTitleChange,
        handleTitleCommit,
        handleNoteChange,
        handleImageUpload,
        handleImageDelete,
        handleMediaItemDelete,
        handleAddResourceLink,
        handleRemoveResourceLink,
        handleCommitResourceLink,
        handleSaveStoryEntry,
        handleRemoveStoryEntry,
        handleRemoveWidget,
        handleRateEntity,
        handleOpenNearbyPin,
        handleUpdateWidgetBackground,
        setDeleteWarningOpen,
      },
    });

    if (!content) {
      return null;
    }

    if (!reorderable) {
      return <WidgetErrorBoundary key={widget.id}>{content}</WidgetErrorBoundary>;
    }

    return (
      <ShellSlot
        key={widget.id}
        isDragging={draggedWidgetId === widget.id}
        isDropTarget={dropTarget?.widgetId === widget.id}
        dropEdge={dropTarget?.widgetId === widget.id ? dropTarget.edge : null}
        onDragStart={(event) => handleDragStart(event, widget.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => handleDragOver(event, widget.id)}
        onDrop={(event) => handleDrop(event, widget.id)}
      >
        <WidgetErrorBoundary>{content}</WidgetErrorBoundary>
      </ShellSlot>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close entity widgets"
            onClick={() => void handleClose()}
            className="fixed inset-0 z-[48] bg-black/12 backdrop-blur-[1px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <EntityDeleteDialog
            open={deleteWarningOpen}
            saving={saving}
            title={activeData.title}
            entityType={normalizedEntity.type}
            onCancel={() => setDeleteWarningOpen(false)}
            onConfirm={() => void handleDelete()}
          />

          <RightEntityShell
            shellId="right_entity_shell"
            isOpen={isOpen}
            onClose={() => void handleClose()}
            title={normalizedEntity.title}
            subtitle={activeData.subtitle || (entityType ? `${entityType} widget` : "Entity widget")}
            entityType={normalizedEntity.type}
            pinnedChildren={
              resolvedPinnedEntityWidgets.length > 0 ? (
                <>
                  {resolvedPinnedEntityWidgets.map((widget) =>
                    renderWidget(widget, false, "pinned")
                  )}
                </>
              ) : undefined
            }
            runtimeState={{
              entityId: activeData.id,
              entityType: entityType || "pin",
              entityTitle: normalizedEntity.title,
              entitySubtitle: activeData.subtitle || null,
              saving,
              deleteWarningOpen,
              interactionsDisabled: widgetInteractionsDeferred,
            }}
          >
            {loading ? (
              <>
                <EntityOverlaySkeletonCard emphasis="hero" />
                <EntityOverlaySkeletonCard />
              </>
            ) : resolvedMainEntityWidgets.length === 0 && resolvedPinnedEntityWidgets.length === 0 ? (
              <EntityOverlayEmptyState />
            ) : (
              resolvedMainEntityWidgets.map((widget, index) => (
                <DeferredEntityWidgetSlot
                  key={widget.id}
                  eager={index === 0}
                  estimatedHeight={heavyWidgetHeightByComponentKey[widget.componentKey] ?? 220}
                  render={() => (
                    <div
                      data-testid={`entity-main-widget-${index}`}
                      style={{
                        contentVisibility: "auto",
                        containIntrinsicSize: "320px",
                      }}
                    >
                      {renderWidget(widget, true)}
                    </div>
                  )}
                />
              ))
            )}
          </RightEntityShell>
        </>
      )}
    </AnimatePresence>
  );
}
