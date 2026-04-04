"use client";

import { type ReactNode } from "react";

import { ShellRuntimeProvider } from "@/components/shells/ShellRuntimeProvider";
import { EntityDeleteWidgetCard } from "@/components/widgets/EntityDeleteWidgetCard";
import { EntityInfoWidgetCard } from "@/components/widgets/EntityInfoWidgetCard";
import { EntityPlaceholderWidgetCard } from "@/components/widgets/EntityPlaceholderWidgetCard";
import { EntityRatingWidgetCard } from "@/components/widgets/EntityRatingWidgetCard";
import { GlobalOverviewWidgetCard } from "@/components/widgets/global-widgets/GlobalOverviewWidgetCard";
import { UserAccountActionsWidgetCard } from "@/components/widgets/user-widgets/UserAccountActionsWidgetCard";
import { UserProfileWidgetCard } from "@/components/widgets/user-widgets/UserProfileWidgetCard";
import { ShellCollectionsWidget } from "@/components/widgets/shell-widgets/ShellCollectionsWidget";
import { ShellControlsWidget } from "@/components/widgets/shell-widgets/ShellControlsWidget";
import { ShellCreateCollectionWidget } from "@/components/widgets/shell-widgets/ShellCreateCollectionWidget";
import { ShellFinishTraceWidget } from "@/components/widgets/shell-widgets/ShellFinishTraceWidget";
import { ShellModeSwitchWidget } from "@/components/widgets/shell-widgets/ShellModeSwitchWidget";
import { ShellRemoveTracePointWidget } from "@/components/widgets/shell-widgets/ShellRemoveTracePointWidget";
import { ShellResetViewWidget } from "@/components/widgets/shell-widgets/ShellResetViewWidget";
import { ShellSearchWidget } from "@/components/widgets/shell-widgets/ShellSearchWidget";
import type { WidgetDefinitionRecord, WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

const noop = () => {};
const asyncNoop = async () => {};

const shellPreviewState = {
  collectionQuery: "",
  interactionMode: "pin",
  areasDisabled: false,
  interactionLocked: false,
  highlightedCollectionId: "",
  editingCollectionId: null,
};

const previewWidget = (definition: WidgetDefinitionRecord): WidgetInstanceRecord => ({
  id: `preview:${definition.slug}`,
  definitionId: definition.id,
  slug: definition.slug,
  name: definition.name,
  layer: definition.layer,
  entityType: definition.supportedEntityTypes[0] ?? null,
  entityId: null,
  componentKey: definition.componentKey,
  position: 0,
  config: definition.defaultConfig,
  state: {},
});

const previewEntity = (type: WidgetEntityPayload["type"]): WidgetEntityPayload => ({
  id: `preview-${type}`,
  type,
  title: type === "trace" ? "Forest Trail 1" : type === "area" ? "Old Town Zone" : "Interesting Place",
  subtitle: type === "trace" ? "Curated path" : type === "area" ? "Protected area" : "Location",
  description: "Preview entity content for the widget library.",
  imageUrl: null,
  collection: null,
  geometryKind: type === "trace" ? "line" : type === "area" ? "polygon" : "point",
  metadata: {},
});

const withShellRuntime = (children: ReactNode) => (
  <ShellRuntimeProvider shellId="widget-library-preview" initialState={shellPreviewState}>
    {children}
  </ShellRuntimeProvider>
);

interface LibraryWidgetPreviewProps {
  definition: WidgetDefinitionRecord;
}

export const LibraryWidgetPreview = ({
  definition,
}: LibraryWidgetPreviewProps) => {
  const widget = previewWidget(definition);
  const pinEntity = previewEntity("pin");
  const traceEntity = previewEntity("trace");
  const previewProfile = {
    email: "curator@atelier.com",
    displayName: "Curator",
    avatarStyle: "mondrian-primary",
    emailVerifiedAt: new Date().toISOString(),
  };

  switch (definition.componentKey) {
    case "global_overview":
      return <GlobalOverviewWidgetCard widget={widget} />;
    case "user_profile":
      return (
        <UserProfileWidgetCard
          widget={widget}
          profile={previewProfile}
          saving={false}
          onSave={asyncNoop}
        />
      );
    case "user_account_actions":
      return (
        <UserAccountActionsWidgetCard
          widget={widget}
          profile={previewProfile}
          resendPending={false}
          resetPending={false}
          passwordChangePending={false}
          onResendVerification={asyncNoop}
          onRequestPasswordReset={asyncNoop}
          onChangePassword={async () => ({ ok: true, message: "Preview only." })}
        />
      );
    case "shell_search":
      return withShellRuntime(<ShellSearchWidget />);
    case "shell_mode_switch":
      return withShellRuntime(<ShellModeSwitchWidget config={definition.defaultConfig} />);
    case "shell_collections":
      return withShellRuntime(
        <ShellCollectionsWidget
          collections={[
            { id: "c1", name: "Interesting Places", color: "#2563eb", icon: "pin", itemCount: 10 },
            { id: "c2", name: "Forest Trail 1", color: "#f59e0b", icon: "route", itemCount: 35 },
          ]}
          collectionsLoaded
          highlightedCollectionId="c1"
          editingCollection={null}
          editingCollectionId={null}
          itemLabel="pin"
          layerVisibility={{} as never}
          awaitingCollectionSelection={false}
          primaryActionLabel="Use"
          selectionCommitPendingId={null}
          saving={false}
          onCollectionClick={noop}
          onToggleCollectionVisibility={noop}
          onShowOnlyCollection={noop}
          onCollectionNameChange={noop}
          onCollectionColorChange={noop}
          onCollectionDone={asyncNoop}
          onRequestDeleteCollection={noop}
        />
      );
    case "shell_controls":
      return (
        <ShellControlsWidget
          isSatellite
          setIsSatellite={noop}
          terrain3D={false}
          setTerrain3D={noop}
          curveMode
          setCurveMode={noop}
          disabled
        />
      );
    case "shell_create_collection":
      return <ShellCreateCollectionWidget onCreateCollection={noop} saving={false} />;
    case "shell_reset_view":
      return <ShellResetViewWidget onResetView={noop} />;
    case "shell_finish_trace":
      return <ShellFinishTraceWidget visible onFinishTraceDraft={noop} />;
    case "shell_remove_trace_point":
      return <ShellRemoveTracePointWidget visible selectedTraceNodeIndex={1} onRemoveSelectedTraceNode={noop} />;
    case "entity_info":
      return (
        <EntityInfoWidgetCard
          widget={widget}
          entity={pinEntity}
          pinNote="Preview note"
          pinImage={null}
          imageFile={null}
          saving={false}
          editable={false}
          onNoteChange={noop as never}
          onImageUpload={async () => {}}
          onImageDelete={async () => {}}
        />
      );
    case "entity_delete":
      return (
        <EntityDeleteWidgetCard
          widget={widget}
          entity={pinEntity}
          saving={false}
          disabled
          onDelete={noop}
        />
      );
    case "entity_rating":
      return (
        <EntityRatingWidgetCard
          widget={widget}
          entity={pinEntity}
          value={4}
          saving={false}
          disabled
          onRate={noop}
        />
      );
    case "entity_gallery":
      return (
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={pinEntity}
          eyebrow="Gallery"
          body="This widget hosts a multi-photo gallery."
        />
      );
    case "entity_stories":
      return (
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={pinEntity}
          eyebrow="Stories"
          body="This widget stores markdown stories and notes."
        />
      );
    case "entity_resources":
      return (
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={pinEntity}
          eyebrow="Resources"
          body="This widget collects external resource links."
        />
      );
    case "entity_nearby_pins":
      return (
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={pinEntity}
          eyebrow="Nearby Pins"
          body="This widget surfaces nearby highly-rated pins."
        />
      );
    case "entity_transport_mode":
      return (
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={traceEntity}
          eyebrow="Transport"
          body="This widget captures how the route was traveled."
        />
      );
    default:
      return (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 px-4 py-8 text-center text-sm text-neutral-500">
          {definition.name}
        </div>
      );
  }
};
