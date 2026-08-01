"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { useMemo, useState, type ComponentType } from "react";
import { Blocks } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { PreviewSignalBusProvider, WiringConfigProvider, type WiringConfig } from "@synarava/wiring-engine";

import { CurrentWidgetProvider, EntityProvider } from "@/modules/entity/EntityContext";
import type { EntityWidgetBindingsResult } from "@/modules/entity/hooks/useEntityWidgetBindings";
import { MapControlsProvider } from "@/contexts/map-controls-context";
import { MapModeProvider } from "@/modules/map/MapModeContext";
import { UserShellProvider } from "@/contexts/user-shell-context";
import { CollectionsStateProvider } from "@/modules/collections/CollectionsContext";
import {
  ENTITY_WIDGET_REGISTRY,
  GLOBAL_WIDGET_REGISTRY,
  USER_WIDGET_REGISTRY,
  WIDGET_REGISTRY,
} from "@/modules/shell/widget-manifest";
import { DEFAULT_MAP_STYLE_ID, type MapStyleId } from "@/modules/map/config";
import type { WidgetDefinitionRecord, WidgetInstanceRecord } from "@/lib/widgets";
import type { InteractionMode } from "@/modules/collections/types";
import type { TraceRoutingMode } from "@/modules/map/types";

const PREVIEW_WIRING: WiringConfig = {
  shellId: "widget-library-preview",
  userConnections: [],
  systemBindings: [
    {
      busKey: "preview.mode",
      label: "Preview interaction mode",
      source: { widgetKey: "shell_mode_switch", portKey: "mode_out" },
      sinks: [{ widgetKey: "shell_mode_switch", portKey: "mode_in" }],
    },
  ],
};

const unsafeInteractivePreviews = new Set([
  "user_account_actions",
]);

function makePreviewWidget(definition: WidgetDefinitionRecord): WidgetInstanceRecord {
  return {
    id: `preview-${definition.id}`,
    definitionId: definition.id,
    slug: definition.slug,
    name: definition.name,
    layer: definition.layer,
    entityType: definition.layer === "entity" ? "pin" : null,
    entityId: definition.layer === "entity" ? "preview-entity" : null,
    componentKey: definition.componentKey,
    position: 0,
    config: definition.defaultConfig,
    state: {},
  };
}

function PreviewEnvironment({
  definition,
  Component,
}: {
  definition: WidgetDefinitionRecord;
  Component: ComponentType;
}) {
  const widget = useMemo(() => makePreviewWidget(definition), [definition]);
  const isTraceAction =
    definition.componentKey === "shell_finish_trace" ||
    definition.componentKey === "shell_remove_trace_point";
  const [mode, setMode] = useState<InteractionMode>(isTraceAction ? "trace" : "pin");
  const [traceRoutingMode, setTraceRoutingMode] = useState<TraceRoutingMode>("direct");
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>(DEFAULT_MAP_STYLE_ID);
  const [terrain3D, setTerrain3D] = useState(false);
  const [curveMode, setCurveMode] = useState(false);
  const [entityTitle, setEntityTitle] = useState("Museum of Modern Art");
  const [entityRating, setEntityRating] = useState<number | null>(4);
  const [collections, setCollections] = useState([
    { id: "preview-art", name: "Art & Design", color: "#ff1b0a", icon: "A", itemCount: 12 },
    { id: "preview-food", name: "Local Food", color: "#1122ff", icon: "F", itemCount: 8 },
  ]);

  const entityBindings = useMemo(
    () => ({
      normalizedEntity: {
        id: "preview-entity",
        type: "pin" as const,
        title: "Museum of Modern Art",
        subtitle: "Culture Collection",
        description: "A saved place preview.",
        imageUrl: null,
        collection: { id: "preview-collection", name: "New York", color: "#ff1b0a", type: "pin" },
        geometryKind: "point" as const,
        metadata: {},
      },
      entityWidgets: [widget],
      pinnedEntityWidgets: [],
      mainEntityWidgets: [widget],
      loading: false,
      supportsDirectPinEditing: true,
      entityInteractionsUnavailable: false,
      draggedWidgetId: null,
      handleSlotPointerDown: () => undefined,
      entityTitle,
      pinNote: "A compact live preview of the selected place.",
      pinImage: null,
      imageFile: null,
      mediaItems: [],
      nearbyPins: [],
      resourceLinks: [],
      storyEntries: [],
      entityRating,
      saving: false,
      storySaving: false,
      mediaSaving: false,
      removingWidgetId: null,
      deleteWarningOpen: false,
      handleNoteChange: () => undefined,
      handleTitleChange: setEntityTitle,
      handleTitleCommit: async () => undefined,
      handleImageUpload: async () => undefined,
      handleImageDelete: async () => undefined,
      handleMediaItemDelete: async () => undefined,
      handleAddResourceLink: async () => undefined,
      handleRemoveResourceLink: async () => undefined,
      handleCommitResourceLink: async () => undefined,
      handleSaveStoryEntry: async () => undefined,
      handleRemoveStoryEntry: async () => undefined,
      handleDelete: async () => undefined,
      handleRemoveWidget: async () => undefined,
      handleRateEntity: async (value: number) => setEntityRating(value),
      handleOpenNearbyPin: () => undefined,
      handleUpdateWidgetBackground: async () => undefined,
      handleClose: async () => undefined,
      setDeleteWarningOpen: () => undefined,
    }),
    [entityRating, entityTitle, widget]
  ) as unknown as EntityWidgetBindingsResult;

  return (
    <PreviewSignalBusProvider initialSignals={{ "preview.mode": "pin" }}>
      <WiringConfigProvider config={PREVIEW_WIRING}>
        <MapModeProvider
          mode={mode}
          setMode={setMode}
          drawingPath={isTraceAction ? [{ lng: 27.55, lat: 53.9 }, { lng: 27.57, lat: 53.91 }] : []}
          traceRoutingMode={traceRoutingMode}
          setTraceRoutingMode={setTraceRoutingMode}
          traceRoutingPending={false}
          traceRoutingError={null}
          traceDraftFinalized={false}
          areaDraftFinalized={false}
          selectedTraceNodeIndex={definition.componentKey === "shell_remove_trace_point" ? 1 : null}
          pendingPin={null}
          editingTraceId={null}
          editingAreaId={null}
          onFinishTraceDraft={() => undefined}
          onFinishAreaDraft={() => undefined}
          onRemoveSelectedTraceNode={() => undefined}
          onUndoDraft={() => undefined}
          onCancelDraft={() => undefined}
          onClearSelection={() => undefined}
        >
          <MapControlsProvider
            mapStyleId={mapStyleId}
            setMapStyleId={setMapStyleId}
            terrain3D={terrain3D}
            setTerrain3D={setTerrain3D}
            curveMode={curveMode}
            setCurveMode={setCurveMode}
            onResetView={() => undefined}
            disabled={false}
          >
            <UserShellProvider
              profile={{
                email: "curator@synarava.com",
                displayName: "Alex Curator",
                avatarStyle: "mondrian",
                emailVerifiedAt: new Date(0).toISOString(),
              }}
              loading={false}
              previewWidgets={[widget]}
              draggedWidgetId={null}
              handleSlotPointerDown={() => undefined}
              savingProfile={false}
              resendPending={false}
              resetPending={false}
              passwordChangePending={false}
              handleSaveProfile={async () => undefined}
              handleResendVerification={async () => undefined}
              handleRequestPasswordReset={async () => undefined}
              handleChangePassword={async () => ({ ok: true, message: "Preview only" })}
              handleRemoveWidget={async () => undefined}
            >
              <CollectionsStateProvider
                value={{
                  collections,
                  collectionsLoaded: true,
                  displayCollections: collections,
                  highlightedCollectionId: collections[0]?.id ?? "",
                  editingCollectionId: null,
                  editingCollection: null,
                  primaryActionLabel: "Open",
                  selectionCommitPendingId: null,
                  saving: false,
                  awaitingCollectionSelection: false,
                  layerVisibility: Object.fromEntries(
                    collections.map((collection) => [collection.id, { muted: false, solo: false }])
                  ),
                  itemLabel: "pin",
                  collectionPendingDelete: null,
                  onCollectionClick: () => undefined,
                  onToggleCollectionVisibility: () => undefined,
                  onShowOnlyCollection: () => undefined,
                  onNameChange: () => undefined,
                  onColorChange: () => undefined,
                  onDone: async () => undefined,
                  onRequestDelete: () => undefined,
                  onCreateCollection: () =>
                    setCollections((current) => [
                      ...current,
                      {
                        id: `preview-${current.length + 1}`,
                        name: "Untitled Layer",
                        color: "#ffe94d",
                        icon: "+",
                        itemCount: 0,
                      },
                    ]),
                  onConfirmDelete: () => undefined,
                  onImportCollection: async () => undefined,
                }}
              >
                <EntityProvider {...entityBindings}>
                  <CurrentWidgetProvider value={widget}>
                    <Component />
                  </CurrentWidgetProvider>
                </EntityProvider>
              </CollectionsStateProvider>
            </UserShellProvider>
          </MapControlsProvider>
        </MapModeProvider>
      </WiringConfigProvider>
    </PreviewSignalBusProvider>
  );
}

function StaticPreview({ definition }: { definition: WidgetDefinitionRecord }) {
  return (
    <BaseWidget {...WIDGET_GLASS}
      eyebrow={definition.layer}
      title={definition.name}
      subtitle="This system surface is represented by the package at runtime."
      identityVisibility="settings-only"
      accent={
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111111] text-white">
          <Blocks className="h-4 w-4" />
        </div>
      }
    >
      <div className="rounded-2xl border border-black/8 bg-white/55 p-4 text-sm leading-6 text-neutral-600">
        System-managed widget. Its live controls are available in its native shell.
      </div>
    </BaseWidget>
  );
}

export function LibraryWidgetPreview({ definition }: { definition: WidgetDefinitionRecord }) {
  const Component =
    GLOBAL_WIDGET_REGISTRY[definition.componentKey] ??
    ENTITY_WIDGET_REGISTRY[definition.componentKey] ??
    USER_WIDGET_REGISTRY[definition.componentKey] ??
    WIDGET_REGISTRY[definition.componentKey];

  if (!Component || unsafeInteractivePreviews.has(definition.componentKey)) {
    return <StaticPreview definition={definition} />;
  }

  return <PreviewEnvironment definition={definition} Component={Component} />;
}
