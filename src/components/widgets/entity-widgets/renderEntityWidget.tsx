"use client";

import { EntityDeleteWidgetCard } from "@/components/widgets/EntityDeleteWidgetCard";
import { EntityGalleryWidgetCard } from "@/components/widgets/EntityGalleryWidgetCard";
import { EntityInfoWidgetCard } from "@/components/widgets/EntityInfoWidgetCard";
import { EntityNearbyPinsWidgetCard } from "@/components/widgets/EntityNearbyPinsWidgetCard";
import { EntityPlaceholderWidgetCard } from "@/components/widgets/EntityPlaceholderWidgetCard";
import { EntityRatingWidgetCard } from "@/components/widgets/EntityRatingWidgetCard";
import { EntityResourcesWidgetCard } from "@/components/widgets/EntityResourcesWidgetCard";
import { EntityStoriesWidgetCard } from "@/components/widgets/EntityStoriesWidgetCard";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import type { EntityWidgetBindingsResult } from "@/components/widgets/entity-widgets/useEntityWidgetBindings";

interface RenderEntityWidgetProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  presentation?: "default" | "pinned";
  bindings: Pick<
    EntityWidgetBindingsResult,
    | "pinNote"
    | "entityTitle"
    | "pinImage"
    | "mediaItems"
    | "nearbyPins"
    | "handleOpenNearbyPin"
    | "resourceLinks"
    | "storyEntries"
    | "imageFile"
    | "saving"
    | "storySaving"
    | "mediaSaving"
    | "supportsDirectPinEditing"
    | "widgetInteractionsDeferred"
    | "entityRating"
    | "handleTitleCommit"
    | "handleTitleChange"
    | "handleNoteChange"
    | "handleImageUpload"
    | "handleImageDelete"
    | "handleMediaItemDelete"
    | "handleAddResourceLink"
    | "handleRemoveResourceLink"
    | "handleCommitResourceLink"
    | "handleSaveStoryEntry"
    | "handleRemoveStoryEntry"
    | "handleRateEntity"
    | "handleRemoveWidget"
    | "removingWidgetId"
    | "handleUpdateWidgetBackground"
    | "setDeleteWarningOpen"
  >;
}

export const renderEntityWidget = ({
  widget,
  entity,
  presentation = "default",
  bindings,
}: RenderEntityWidgetProps) => {
  const removable = widget.slug !== "entity_info";
  const removing = bindings.removingWidgetId === widget.id;

  if (widget.componentKey === "entity_info") {
    return (
      <div>
        <EntityInfoWidgetCard
          widget={widget}
          entity={entity}
          entityTitle={bindings.entityTitle}
          editable={bindings.supportsDirectPinEditing}
          presentation={presentation}
          onTitleChange={bindings.handleTitleChange}
          onTitleCommit={bindings.handleTitleCommit}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_delete") {
    return (
      <div>
        <EntityDeleteWidgetCard
          widget={widget}
          entity={entity}
          saving={bindings.saving}
          disabled={false}
          onDelete={() => bindings.setDeleteWarningOpen(true)}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_rating") {
    return (
      <div>
        <EntityRatingWidgetCard
          widget={widget}
          entity={entity}
          value={bindings.entityRating}
          disabled={false}
          onRate={bindings.handleRateEntity}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_gallery") {
    return (
      <div>
        <EntityGalleryWidgetCard
          widget={widget}
          entity={entity}
          mediaItems={bindings.mediaItems}
          saving={bindings.mediaSaving}
          onUpload={bindings.handleImageUpload}
          onDeleteMediaItem={bindings.handleMediaItemDelete}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_stories") {
    return (
      <div>
        <EntityStoriesWidgetCard
          widget={widget}
          entity={entity}
          storyEntries={bindings.storyEntries}
          saving={bindings.storySaving}
          onSaveStoryEntry={bindings.handleSaveStoryEntry}
          onRemoveStoryEntry={bindings.handleRemoveStoryEntry}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_resources") {
    return (
      <div>
        <EntityResourcesWidgetCard
          widget={widget}
          entity={entity}
          resources={bindings.resourceLinks}
          onAddResource={bindings.handleAddResourceLink}
          onRemoveResource={bindings.handleRemoveResourceLink}
          onCommitResource={bindings.handleCommitResourceLink}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_nearby_pins") {
    return (
      <div>
        <EntityNearbyPinsWidgetCard
          widget={widget}
          entity={entity}
          nearbyPins={bindings.nearbyPins}
          onOpenNearbyPin={bindings.handleOpenNearbyPin}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  if (widget.componentKey === "entity_transport_mode") {
    const body =
      entity.type === "trace"
        ? "This widget will capture how the route was traveled: walk, car, bus, tram, train, or ferry."
        : entity.type === "area"
          ? "This widget will capture how this zone is typically accessed or experienced: walking, driving, transit, cycling, or mixed access."
          : "This widget will capture how this place is usually reached or experienced: walking, driving, transit, cycling, or mixed access.";

    return (
      <div>
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={entity}
          eyebrow="Transport"
          body={body}
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </div>
    );
  }

  return null;
};
