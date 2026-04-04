"use client";

import { WidgetCenterShell } from "@/components/shells/WidgetCenterShell";
import { WidgetLibraryShell } from "@/components/shells/WidgetLibraryShell";
import { ShellWidgetSlot } from "@/components/shells/ShellWidgetSlot";
import { GlobalWidgetLibraryCard } from "@/components/widgets/global-widgets/GlobalWidgetLibraryCard";
import {
  GlobalWidgetCenterAddCard,
  GlobalWidgetCenterEmptyState,
} from "@/components/widgets/global-widgets/GlobalWidgetStates";
import { renderGlobalWidget } from "@/components/widgets/global-widgets/renderGlobalWidget";
import { useGlobalWidgetBindings } from "@/components/widgets/global-widgets/useGlobalWidgetBindings";
import type { WidgetEntityType } from "@/lib/widgets";

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: WidgetEntityType;
  entityId?: string;
}

export const WidgetPanel = ({
  isOpen,
  onClose,
  entityType,
  entityId,
}: WidgetPanelProps) => {
  const {
    widgets,
    definitions,
    loading,
    libraryOpen,
    addingSlug,
    draggedWidgetId,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    setLibraryOpen,
    handleAddWidgetFromLibrary,
  } = useGlobalWidgetBindings({ isOpen, entityType, entityId });

  return (
    <>
      <WidgetCenterShell
        shellId="widget_center_shell"
        isOpen={isOpen}
        onClose={onClose}
        title="Widget Center"
        subtitle={loading ? "Loading widgets..." : `${widgets.length} active widgets`}
        runtimeState={{
          loading,
          widgetCount: widgets.length,
        }}
      >
        <GlobalWidgetCenterAddCard onOpenLibrary={() => setLibraryOpen(true)} />

        {widgets.length === 0 && !loading ? (
          <GlobalWidgetCenterEmptyState />
        ) : null}

        {widgets.map((widget) => {
          const content = renderGlobalWidget(widget);

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
              {content}
            </ShellWidgetSlot>
          );
        })}
      </WidgetCenterShell>

      <WidgetLibraryShell
        isOpen={isOpen && libraryOpen}
        onClose={() => setLibraryOpen(false)}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {definitions.map((definition) => (
            <GlobalWidgetLibraryCard
              key={definition.id}
              definition={definition}
              onAdd={handleAddWidgetFromLibrary}
              adding={addingSlug === definition.slug}
            />
          ))}
        </div>
      </WidgetLibraryShell>
    </>
  );
};
