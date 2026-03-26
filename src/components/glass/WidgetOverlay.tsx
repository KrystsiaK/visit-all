import { AnimatePresence, motion } from "framer-motion";
import type { WidgetEntityType } from "@/lib/widgets";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { RightEntityShell } from "@/components/shells/RightEntityShell";
import { ShellWidgetSlot } from "@/components/shells/ShellWidgetSlot";
import { WidgetChromeProvider } from "@/components/widgets/WidgetChromeContext";
import { EntityDeleteDialog } from "@/components/widgets/entity-widgets/EntityDeleteDialog";
import { EntityOverlayEmptyState, EntityOverlaySkeletonCard } from "@/components/widgets/entity-widgets/EntityOverlayStates";
import { renderEntityWidget } from "@/components/widgets/entity-widgets/renderEntityWidget";
import { useEntityWidgetBindings } from "@/components/widgets/entity-widgets/useEntityWidgetBindings";
import { getWidgetHostOptions } from "@/lib/widget-hosts";

interface WidgetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSaved?: () => void;
  onWidgetHostMoved?: () => void;
  refreshTrigger?: number;
  onDeletePin?: (pinId: string, collectionId?: string) => Promise<void>;
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

export function WidgetOverlay({ isOpen, onClose, onDataSaved, onWidgetHostMoved, refreshTrigger, onDeletePin, entityType, entityId, data }: WidgetOverlayProps) {
  const {
    widgetInteractionsDeferred,
    pinNote,
    pinImage,
    imageFile,
    saving,
    deleteWarningOpen,
    entityRating,
    entityWidgets,
    loading,
    draggedWidgetId,
    dropTarget,
    activeData,
    normalizedEntity,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleMoveWidgetHost,
    handleNoteChange,
    handleImageUpload,
    handleImageDelete,
    handleDelete,
    handleRateEntity,
    handleClose,
    setDeleteWarningOpen,
  } = useEntityWidgetBindings({
    isOpen,
    refreshTrigger,
    entityType,
    entityId,
    data,
    onDataSaved,
    onWidgetHostMoved,
    onClose,
    onDeletePin,
  });

  if (!data && !normalizedEntity.id) return null;

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
            onCancel={() => setDeleteWarningOpen(false)}
            onConfirm={() => void handleDelete()}
          />

          <RightEntityShell
            shellId="right_entity_shell"
            isOpen={isOpen}
            onClose={() => void handleClose()}
            title={normalizedEntity.title}
            subtitle={activeData.subtitle || (entityType ? `${entityType} widget` : "Entity widget")}
            loading={loading}
            entityType={normalizedEntity.type}
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
            ) : entityWidgets.length === 0 ? (
              <EntityOverlayEmptyState />
            ) : entityWidgets.map((widget) => {
              const content = renderEntityWidget({
                widget,
                entity: normalizedEntity,
                bindings: {
                  pinNote,
                  pinImage,
                  imageFile,
                  saving,
                  supportsDirectPinEditing: entityType === "pin" || !entityType,
                  widgetInteractionsDeferred,
                  entityRating,
                  handleNoteChange,
                  handleImageUpload,
                  handleImageDelete,
                  handleRateEntity,
                  setDeleteWarningOpen,
                },
              });

              if (!content) {
                return null;
              }

              return (
                <ShellWidgetSlot
                  key={widget.id}
                  isDragging={draggedWidgetId === widget.id}
                  isDropTarget={dropTarget?.widgetId === widget.id}
                  dropEdge={dropTarget?.widgetId === widget.id ? dropTarget.edge : null}
                  onDragStart={(event) => handleDragStart(event, widget.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(event) => handleDragOver(event, widget.id)}
                  onDrop={(event) => handleDrop(event, widget.id)}
                >
                  <WidgetChromeProvider
                    currentHost="pin_entity_shell"
                    hostOptions={getWidgetHostOptions(["pin_entity_shell", "left_sidebar"])}
                    hostSelectionDisabled={widget.componentKey === "entity_delete"}
                    onHostChange={(host) => void handleMoveWidgetHost(widget.id, host)}
                  >
                    <WidgetErrorBoundary>{content}</WidgetErrorBoundary>
                  </WidgetChromeProvider>
                </ShellWidgetSlot>
              );
            })}
          </RightEntityShell>
        </>
      )}
    </AnimatePresence>
  );
}
