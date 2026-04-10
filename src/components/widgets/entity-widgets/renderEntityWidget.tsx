"use client";

import { motion } from "framer-motion";

import { EntityDeleteWidgetCard } from "@/components/widgets/EntityDeleteWidgetCard";
import { EntityGalleryWidgetCard } from "@/components/widgets/EntityGalleryWidgetCard";
import { EntityInfoWidgetCard } from "@/components/widgets/EntityInfoWidgetCard";
import { EntityNearbyPinsWidgetCard } from "@/components/widgets/EntityNearbyPinsWidgetCard";
import { EntityPlaceholderWidgetCard } from "@/components/widgets/EntityPlaceholderWidgetCard";
import { EntityRatingWidgetCard } from "@/components/widgets/EntityRatingWidgetCard";
import { EntityResourcesWidgetCard } from "@/components/widgets/EntityResourcesWidgetCard";
import { EntityStoriesWidgetCard } from "@/components/widgets/EntityStoriesWidgetCard";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import { overlayItemVariants } from "@/lib/motion";
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
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_delete") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_rating" && entity.type === "pin") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_gallery") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_stories") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_resources") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_nearby_pins" && entity.type === "pin") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
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
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_transport_mode" && entity.type === "trace") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={entity}
          eyebrow="Transport"
          body="This widget will capture how the route was traveled: walk, car, bus, tram, train, or ferry."
          onBackgroundStyleChange={bindings.handleUpdateWidgetBackground}
          removing={removing}
          canRemove={removable}
          onRemove={() => void bindings.handleRemoveWidget(widget.id)}
        />
      </motion.div>
    );
  }

  return null;
};
