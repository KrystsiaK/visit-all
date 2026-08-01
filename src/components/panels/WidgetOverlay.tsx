"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  BaseShell,
  ShellRuntimeProvider,
  ShellSlot,
  WidgetProvider,
  useShellRuntimeActions,
} from "@synarava/shell-kit";
import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { EntityDeleteDialog } from "@/modules/entity/components/EntityDeleteDialog";
import { EntityOverlaySkeletonCard } from "@/modules/entity/components/EntityOverlayStates";
import { useEntityWidgetBindings } from "@/modules/entity/hooks/useEntityWidgetBindings";
import { getEntityWidgetHost, getWidgetHostOptions } from "@/modules/shell/widget-hosts";
import { ENTITY_WIDGET_REGISTRY, WIDGET_REGISTRY } from "@/modules/shell/widget-manifest";
import {
  EntityProvider,
  CurrentWidgetProvider,
  useEntityMeta,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";
import { SHELL_GLASS } from "@/modules/shell/constants";
import { SHELL_PANEL_CONTENT_LAYOUT, SHELL_PANEL_STYLE } from "@/modules/shell/constants";
import { EntityInfoWidgetCard } from "@/modules/entity/widgets/EntityInfoWidgetCard";
import { useGeneratedWidgetsForHost } from "@/modules/widget-runtime/useGeneratedWidgetsForHost";
import { GeneratedWidgetSlot } from "@/modules/widget-runtime/GeneratedWidgetSlot";
import { notifyWidgetLibraryChanged } from "@/modules/widget-runtime/notifyWidgetLibraryChanged";
import { EntitySignalBridge } from "@/modules/entity/EntitySignalBridge";
import { EntityWiringProvider } from "@/modules/entity/EntityWiringProvider";
import type { WidgetInstanceRecord, WidgetEntityType } from "@/lib/widgets";
import type { EntityNearbyPinRecord } from "@/app/actions";

interface WidgetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSaved?: () => void;
  refreshTrigger?: number;
  onDeletePin?: (pinId: string, collectionId?: string) => Promise<void>;
  onOpenNearbyPin?: (nearbyPin: EntityNearbyPinRecord) => void;
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

function WidgetSlot({ widget, index }: { widget: WidgetInstanceRecord; index: number }) {
  const { draggedWidgetId, handleSlotPointerDown } = useEntityMeta();

  const Component =
    ENTITY_WIDGET_REGISTRY[widget.componentKey] ??
    WIDGET_REGISTRY[widget.componentKey];

  if (!Component) return null;

  const isEntityInfo = widget.componentKey === "entity_info";

  return (
    <div data-testid={`entity-main-widget-${index}`}>
      <ShellSlot
        widgetId={widget.id}
        isDragging={draggedWidgetId === widget.id}
        onHandlePointerDown={(e) => handleSlotPointerDown(e, widget.id)}
      >
        <WidgetErrorBoundary>
          <CurrentWidgetProvider value={widget}>
            {isEntityInfo ? <EntityInfoWidgetCard /> : <Component />}
          </CurrentWidgetProvider>
        </WidgetErrorBoundary>
      </ShellSlot>
    </div>
  );
}

function PinnedWidget({ widget }: { widget: WidgetInstanceRecord }) {
  const Component =
    ENTITY_WIDGET_REGISTRY[widget.componentKey] ??
    WIDGET_REGISTRY[widget.componentKey];

  if (!Component) return null;

  const isEntityInfo = widget.componentKey === "entity_info";

  return (
    <WidgetErrorBoundary>
      <CurrentWidgetProvider value={widget}>
        {isEntityInfo ? <EntityInfoWidgetCard presentation="pinned" /> : <Component />}
      </CurrentWidgetProvider>
    </WidgetErrorBoundary>
  );
}

// Reads from EntityProvider + ShellRuntimeProvider contexts — must be rendered inside both
function EntityShellContent({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { registerScrollContainer } = useShellRuntimeActions();
  const {
    normalizedEntity,
    pinnedEntityWidgets,
    mainEntityWidgets,
    loading,
  } = useEntityMeta();
  const { deleteWarningOpen, saving } = useEntityWriteState();
  const { handleDelete, setDeleteWarningOpen, handleClose } = useEntityActions();

  // Escape → close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") void handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  // Show backdrop only on mobile (so desktop map stays fully interactive)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const widgetHost = getEntityWidgetHost(normalizedEntity.type);
  const generatedWidgets = useGeneratedWidgetsForHost("shared_entity_shell", isOpen);

  const resolvedPinned: WidgetInstanceRecord[] =
    pinnedEntityWidgets.length > 0
      ? pinnedEntityWidgets
      : mainEntityWidgets.filter((w) => w.componentKey === "entity_info");

  const resolvedMain: WidgetInstanceRecord[] = mainEntityWidgets.filter(
    (w) => !resolvedPinned.some((p) => p.id === w.id)
  );

  // Pinned zone: entity hero + X close button overlaid top-right
  const pinnedContent =
    resolvedPinned.length > 0 ? (
      <div className="relative">
        {resolvedPinned.map((widget) => <PinnedWidget key={widget.id} widget={widget} />)}
        <button
          type="button"
          onClick={() => void handleClose()}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-neutral-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-900"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : undefined;

  return (
    <>
      <EntityDeleteDialog
        open={deleteWarningOpen}
        saving={saving}
        title={normalizedEntity.title}
        entityType={normalizedEntity.type}
        onCancel={() => setDeleteWarningOpen(false)}
        onConfirm={() => void handleDelete()}
      />

      <BaseShell
        isOpen={isOpen}
        onClose={() => void handleClose()}
        title={normalizedEntity.title}
        subtitle=""
        closeLabel="Close entity panel"
        backdropCloseLabel="Dismiss entity panel"
        showHeader={false}
        showBackdrop={isMobile}
        mobileHandle={false}
        placement="right"
        swipeToClose
        pinnedContent={pinnedContent}
        {...SHELL_GLASS}
        shellClassName="fixed bottom-3 left-3 right-3 top-3 z-[90] flex max-w-[calc(100vw-1.5rem)] flex-col md:left-auto md:w-[var(--shell-panel-width)]"
        shellStyle={SHELL_PANEL_STYLE}
        {...SHELL_PANEL_CONTENT_LAYOUT}
        scrollContainerRef={registerScrollContainer}
        scrollContainerDataId="right_entity_shell"
      >
        <WidgetProvider
          currentHost={widgetHost}
          hostOptions={getWidgetHostOptions([widgetHost])}
          hostSelectionDisabled
        >
          {loading ? (
            <>
              <EntityOverlaySkeletonCard emphasis="hero" />
              <EntityOverlaySkeletonCard />
            </>
          ) : (
            <>
              {resolvedMain.map((widget, index) => (
                <WidgetSlot key={widget.id} widget={widget} index={index} />
              ))}
              {generatedWidgets.map((widget) => (
                <GeneratedWidgetSlot
                  key={widget.id}
                  widget={widget}
                  host="shared_entity_shell"
                  onRemoved={() => notifyWidgetLibraryChanged()}
                />
              ))}
            </>
          )}
        </WidgetProvider>
      </BaseShell>
    </>
  );
}

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
  const bindings = useEntityWidgetBindings({
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

  const { activeData, normalizedEntity } = bindings;

  const shellInitialState = useMemo(
    () => ({ title: normalizedEntity.title || "", subtitle: "" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeData.id]
  );

  if (!data && !normalizedEntity.id) return null;

  return (
    <EntityProvider {...bindings}>
      <EntityWiringProvider>
        <ShellRuntimeProvider
          key={activeData.id}
          shellId="right_entity_shell"
          initialState={shellInitialState}
        >
          <EntitySignalBridge />
          <EntityShellContent isOpen={isOpen} onClose={onClose} />
        </ShellRuntimeProvider>
      </EntityWiringProvider>
    </EntityProvider>
  );
}
