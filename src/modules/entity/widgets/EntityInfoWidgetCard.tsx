import { WIDGET_GLASS } from "@/modules/shell/constants";
import { memo } from "react";
import { MapPin, PencilLine } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { InlineEditableText, PillTag, RemoveWidgetButton } from "@synarava/ui-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import type { WidgetEntityPayload } from "@/lib/widgets";
import {
  useCurrentWidget,
  useEntityMeta,
  useEntityData,
  useEntityWriteState,
  useEntityActions,
} from "@/modules/entity/EntityContext";

function getAccentClasses(type: WidgetEntityPayload["type"]) {
  if (type === "trace") return "bg-[#1122ff] text-white";
  if (type === "area") return "bg-[#ffe94d] text-black";
  return "bg-[#ff1b0a] text-white";
}

interface EntityInfoWidgetCardProps {
  presentation?: "default" | "pinned";
}

export const EntityInfoWidgetCard = memo(function EntityInfoWidgetCard({
  presentation = "default",
}: EntityInfoWidgetCardProps) {
  const widget = useCurrentWidget();
  const { normalizedEntity: entity, supportsDirectPinEditing: editable } = useEntityMeta();
  const { entityTitle } = useEntityData();
  const { removingWidgetId } = useEntityWriteState();
  const { handleTitleChange, handleTitleCommit, handleUpdateWidgetBackground, handleRemoveWidget } = useEntityActions();

  const canRemove = widget ? widget.slug !== "entity_info" : false;
  const removing = removingWidgetId === widget?.id;

  const subtitleLabel =
    entity.type === "trace" ? "Path Layer" : entity.type === "area" ? "Zone Layer" : "Location";

  if (presentation === "pinned") {
    return (
      <BaseWidget {...WIDGET_GLASS}
        dataTestId="entity-pinned-hero"
        eyebrow={subtitleLabel}
        title={entityTitle || entity.title}
        subtitle={entity.subtitle || `${entity.type} entity`}
        identityVisibility="settings-only"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${getAccentClasses(entity.type)}`}>
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">{subtitleLabel}</p>
            <div className="mt-1">
              <InlineEditableText
                value={entityTitle}
                placeholder={entity.title}
                disabled={false}
                editable={editable}
                onChange={handleTitleChange}
                onCommit={handleTitleCommit}
                readOnlyClassName="truncate text-[16px] font-black tracking-tight text-neutral-950"
                inputClassName="w-full border-none bg-transparent p-0 text-[16px] font-black tracking-tight text-neutral-950 outline-none placeholder:text-neutral-300"
              />
            </div>
            <p className="mt-1 truncate text-sm leading-5 text-[#737373]">{entity.subtitle || `${entity.type} entity`}</p>
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...WIDGET_GLASS}
      title={entityTitle || entity.title}
      subtitle={entity.subtitle || `${entity.type} entity`}
      backgroundStyle={widget ? (normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default") : "default"}
      onBackgroundStyleChange={
        widget && handleUpdateWidgetBackground
          ? (style) => void handleUpdateWidgetBackground(widget.id, style)
          : undefined
      }
      settingsContent={canRemove && widget ? <RemoveWidgetButton onRemove={() => void handleRemoveWidget(widget.id)} removing={removing} /> : null}
      accent={
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${getAccentClasses(entity.type)}`}>
          <MapPin className="h-4 w-4" />
        </div>
      }
    >
      <div className="rounded-[24px] bg-white/55 p-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${getAccentClasses(entity.type)}`}>
            <PencilLine className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Inline title</p>
            <InlineEditableText
              value={entityTitle}
              placeholder={entity.title}
              disabled={false}
              editable={editable}
              onChange={handleTitleChange}
              onCommit={handleTitleCommit}
              className="mt-2"
              readOnlyClassName="text-[28px] font-black tracking-tight text-neutral-950"
              inputClassName="w-full border-none bg-transparent p-0 text-[28px] font-black tracking-tight text-neutral-950 outline-none placeholder:text-neutral-300"
            />
            <p className="mt-2 text-sm leading-5 text-neutral-500">
              Name lives in the independent entity enrichment layer and this widget only reads or triggers its persistence.
            </p>
          </div>
        </div>
      </div>
      {widget && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
          <div className="flex flex-wrap gap-2">
            <PillTag>{widget.name}</PillTag>
            <PillTag uppercase>{entity.type}</PillTag>
          </div>
        </div>
      )}
    </BaseWidget>
  );
});
