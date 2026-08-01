import { WIDGET_GLASS } from "@/modules/shell/constants";
import { BaseWidget } from "@synarava/shell-kit";
import { normalizeWidgetBackgroundStyle } from "@/modules/shell/widget-background-style";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityPlaceholderWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  eyebrow: string;
  body: string;
  canRemove?: boolean;
  removing?: boolean;
  onBackgroundStyleChange?: (widgetId: string, backgroundStyle: string) => void;
  onRemove?: () => void;
}

export const EntityPlaceholderWidgetCard = ({
  widget,
  entity,
  eyebrow,
  body,
  canRemove = false,
  removing = false,
  onBackgroundStyleChange,
  onRemove,
}: EntityPlaceholderWidgetCardProps) => (
  <BaseWidget {...WIDGET_GLASS}
    eyebrow={eyebrow}
    title={widget.name}
    backgroundStyle={normalizeWidgetBackgroundStyle(widget.config.chromeBackgroundStyle) ?? "default"}
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
  >
    <p className="text-sm leading-6 text-[#5a5a5a]">{body}</p>

    <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
          {entity.title}
        </span>
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase text-[#525252]">
          {entity.type}
        </span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
        Planned
      </span>
    </div>
  </BaseWidget>
);
