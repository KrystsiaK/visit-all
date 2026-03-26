import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityPlaceholderWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  eyebrow: string;
  body: string;
}

export const EntityPlaceholderWidgetCard = ({
  widget,
  entity,
  eyebrow,
  body,
}: EntityPlaceholderWidgetCardProps) => (
  <WidgetChrome
    eyebrow={eyebrow}
    title={widget.name}
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
  </WidgetChrome>
);
