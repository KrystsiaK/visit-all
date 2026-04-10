import { Trash2 } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityDeleteWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  saving: boolean;
  disabled?: boolean;
  canRemove?: boolean;
  removing?: boolean;
  onDelete: () => void;
  onBackgroundStyleChange?: (widgetId: string, backgroundStyle: string) => void;
  onRemove?: () => void;
}

export function EntityDeleteWidgetCard({
  widget,
  entity,
  saving,
  disabled = false,
  canRemove = false,
  removing = false,
  onDelete,
  onBackgroundStyleChange,
  onRemove,
}: EntityDeleteWidgetCardProps) {
  return (
    <BaseWidget
      title={widget.name}
      subtitle={`Delete the ${entity.type} and all widget-linked data attached to it.`}
      backgroundStyle={
        typeof widget.config.chromeBackgroundStyle === "string"
          ? widget.config.chromeBackgroundStyle
          : "default"
      }
      onBackgroundStyleChange={
        onBackgroundStyleChange
          ? (backgroundStyle) => onBackgroundStyleChange(widget.id, backgroundStyle)
          : undefined
      }
      settingsContent={
        canRemove && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#c61f1f]/15 bg-[#fff6f6] px-4 text-sm font-medium text-[#a11a1a] transition-colors hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {removing ? "Removing..." : "Remove Widget"}
          </button>
        ) : null
      }
      className="border-[rgba(214,0,0,0.12)]"
      accent={
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff1b0a] text-white">
          <Trash2 className="h-4 w-4" />
        </div>
      }
    >

      <div className="mt-4 rounded-xl bg-[rgba(255,0,0,0.04)] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a33b3b]">
          Destructive Action
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#6b4a4a]">
          This removes the entity, associated entity widgets, and related local media files.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
            {entity.title}
          </span>
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase text-[#525252]">
            {entity.type}
          </span>
        </div>

        <button
          onClick={onDelete}
          disabled={saving || disabled}
          className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-[#d60000] transition-colors hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {disabled ? "Deferred" : "Delete"}
        </button>
      </div>
    </BaseWidget>
  );
}
