import { WIDGET_GLASS } from "@/modules/shell/constants";
import { memo } from "react";
import { Trash2 } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { PillTag, RemoveWidgetButton } from "@synarava/ui-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

export const EntityDeleteWidgetCard = memo(function EntityDeleteWidgetCard() {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity, entityInteractionsUnavailable } = useEntityMeta();
  const { saving, removingWidgetId } = useEntityWriteState();
  const { handleUpdateWidgetBackground, handleRemoveWidget, setDeleteWarningOpen } = useEntityActions();

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;

  return (
    <BaseWidget {...WIDGET_GLASS}
      title={widget?.name ?? "Delete"}
      subtitle={`Delete the ${entity.type} and all widget-linked data attached to it.`}
      backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
      onBackgroundStyleChange={
        widget ? (style) => void handleUpdateWidgetBackground(widget.id, style) : undefined
      }
      settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
      className="border-[rgba(214,0,0,0.12)]"
      accent={
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff1b0a] text-white">
          <Trash2 className="h-4 w-4" />
        </div>
      }
    >
      <div className="mt-4 rounded-xl bg-[rgba(255,0,0,0.04)] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a33b3b]">Destructive Action</p>
        <p className="mt-3 text-sm leading-relaxed text-[#6b4a4a]">
          This removes the entity, associated entity widgets, and related local media files.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <PillTag>{entity.title}</PillTag>
          <PillTag uppercase>{entity.type}</PillTag>
        </div>
        <button
          onClick={() => setDeleteWarningOpen(true)}
          disabled={saving || entityInteractionsUnavailable}
          className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-[#d60000] transition-colors hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </BaseWidget>
  );
});
