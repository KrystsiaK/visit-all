"use client";

import { motion } from "framer-motion";

import { EntityDeleteWidgetCard } from "@/components/widgets/EntityDeleteWidgetCard";
import { EntityInfoWidgetCard } from "@/components/widgets/EntityInfoWidgetCard";
import { EntityPlaceholderWidgetCard } from "@/components/widgets/EntityPlaceholderWidgetCard";
import { EntityRatingWidgetCard } from "@/components/widgets/EntityRatingWidgetCard";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import { overlayItemVariants } from "@/lib/motion";
import type { EntityWidgetBindingsResult } from "@/components/widgets/entity-widgets/useEntityWidgetBindings";

interface RenderEntityWidgetProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  bindings: Pick<
    EntityWidgetBindingsResult,
    | "pinNote"
    | "pinImage"
    | "imageFile"
    | "saving"
    | "supportsDirectPinEditing"
    | "widgetInteractionsDeferred"
    | "entityRating"
    | "handleNoteChange"
    | "handleImageUpload"
    | "handleImageDelete"
    | "handleRateEntity"
    | "setDeleteWarningOpen"
  >;
}

export const renderEntityWidget = ({
  widget,
  entity,
  bindings,
}: RenderEntityWidgetProps) => {
  if (widget.componentKey === "entity_info") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityInfoWidgetCard
          widget={widget}
          entity={entity}
          pinNote={bindings.pinNote}
          pinImage={bindings.pinImage}
          imageFile={bindings.imageFile}
          saving={bindings.saving}
          editable={bindings.supportsDirectPinEditing}
          interactionsDisabled={bindings.widgetInteractionsDeferred}
          onNoteChange={bindings.handleNoteChange}
          onImageUpload={bindings.handleImageUpload}
          onImageDelete={bindings.handleImageDelete}
        />
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_delete" && bindings.supportsDirectPinEditing) {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityDeleteWidgetCard
          widget={widget}
          entity={entity}
          saving={bindings.saving}
          disabled={bindings.widgetInteractionsDeferred}
          onDelete={() => bindings.setDeleteWarningOpen(true)}
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
          saving={bindings.saving}
          disabled={bindings.widgetInteractionsDeferred}
          onRate={bindings.handleRateEntity}
        />
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_gallery") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={entity}
          eyebrow="Gallery"
          body="This widget will host a full multi-photo gallery for the entity container."
        />
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_stories") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={entity}
          eyebrow="Stories"
          body="This widget will host markdown story entries and longer narrative notes."
        />
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_resources") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={entity}
          eyebrow="Resources"
          body="This widget will collect many external references and source links for the entity."
        />
      </motion.div>
    );
  }

  if (widget.componentKey === "entity_nearby_pins" && entity.type === "pin") {
    return (
      <motion.div variants={overlayItemVariants} layout="position">
        <EntityPlaceholderWidgetCard
          widget={widget}
          entity={entity}
          eyebrow="Nearby Pins"
          body="This widget will surface nearby highly-rated pins as linked related places."
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
        />
      </motion.div>
    );
  }

  return null;
};
