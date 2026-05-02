import { Star } from "lucide-react";

import { StarRatingInput } from "@/components/inputs/StarRatingInput";
import { BaseWidget } from "@synarava/shell-kit";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityRatingWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  value: number | null;
  disabled?: boolean;
  canRemove?: boolean;
  removing?: boolean;
  onRate: (value: number) => void;
  onBackgroundStyleChange?: (widgetId: string, backgroundStyle: string) => void;
  onRemove?: () => void;
}

export const EntityRatingWidgetCard = ({
  widget,
  entity,
  value,
  disabled = false,
  canRemove = false,
  removing = false,
  onRate,
  onBackgroundStyleChange,
  onRemove,
}: EntityRatingWidgetCardProps) => (
  <BaseWidget
    dataTestId="entity-rating-widget"
    title={widget.name}
    subtitle={`Score this ${entity.type} so nearby discovery and ranking widgets can use a clean signal.`}
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
    accent={
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe94d] text-black">
        <Star className="h-4 w-4" />
      </div>
    }
  >

    <StarRatingInput
      value={value}
      disabled={disabled}
      className="mt-4"
      onChange={onRate}
    />

    <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
          {value ? `${value}/5` : "Unrated"}
        </span>
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase text-[#525252]">
          {entity.type}
        </span>
      </div>
    </div>
  </BaseWidget>
);
