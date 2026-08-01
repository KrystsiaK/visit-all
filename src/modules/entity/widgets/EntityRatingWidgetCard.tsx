import { WIDGET_GLASS } from "@/modules/shell/constants";
import { memo } from "react";
import { Star } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { StarRatingInput, PillTag, RemoveWidgetButton } from "@synarava/ui-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityData,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

export const EntityRatingWidgetCard = memo(function EntityRatingWidgetCard() {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity, entityInteractionsUnavailable } = useEntityMeta();
  const { entityRating } = useEntityData();
  const { saving, removingWidgetId } = useEntityWriteState();
  const { handleRateEntity, handleUpdateWidgetBackground, handleRemoveWidget } = useEntityActions();

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;

  return (
    <BaseWidget {...WIDGET_GLASS}
      dataTestId="entity-rating-widget"
      title={widget?.name ?? "Rating"}
      subtitle={`Score this ${entity.type} so nearby discovery and ranking widgets can use a clean signal.`}
      backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
      onBackgroundStyleChange={widget ? (style) => void handleUpdateWidgetBackground(widget.id, style) : undefined}
      settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
      accent={
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe94d] text-black">
          <Star className="h-4 w-4" />
        </div>
      }
    >
      <StarRatingInput
        value={entityRating}
        disabled={saving || entityInteractionsUnavailable}
        className="mt-4"
        onChange={(value) => void handleRateEntity(value)}
      />
      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <PillTag>{entityRating ? `${entityRating}/5` : "Unrated"}</PillTag>
          <PillTag uppercase>{entity.type}</PillTag>
        </div>
      </div>
    </BaseWidget>
  );
});
