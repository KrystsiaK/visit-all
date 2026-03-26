import { Star } from "lucide-react";

import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import { Tooltip } from "@/components/ui/Tooltip";

interface EntityRatingWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  value: number | null;
  saving: boolean;
  disabled?: boolean;
  onRate: (value: number) => void;
}

export const EntityRatingWidgetCard = ({
  widget,
  entity,
  value,
  saving,
  disabled = false,
  onRate,
}: EntityRatingWidgetCardProps) => (
  <WidgetChrome
    title={widget.name}
    subtitle={`Score this ${entity.type} so nearby discovery and ranking widgets can use a clean signal.`}
    accent={
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe94d] text-black">
        <Star className="h-4 w-4" />
      </div>
    }
  >

    <div className="mt-4 flex items-center gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = (value ?? 0) >= starValue;

        return (
          <Tooltip key={starValue} label={`${starValue} star${starValue === 1 ? "" : "s"}`}>
            <button
              type="button"
              onClick={() => onRate(starValue)}
              disabled={disabled || saving}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                filled
                  ? "border-[#e4be00] bg-[#fff4a8] text-[#7a5d00]"
                  : "border-black/10 bg-white/75 text-neutral-400 hover:border-black/15 hover:text-neutral-700"
              } disabled:cursor-not-allowed disabled:opacity-45`}
              aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
              aria-pressed={filled}
            >
              <Star className={`h-4 w-4 ${filled ? "fill-current" : ""}`} />
            </button>
          </Tooltip>
        );
      })}
    </div>

    <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
          {value ? `${value}/5` : "Unrated"}
        </span>
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase text-[#525252]">
          {entity.type}
        </span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
        {saving ? "Saving" : "Live"}
      </span>
    </div>
  </WidgetChrome>
);
