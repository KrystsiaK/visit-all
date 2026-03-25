import { Trash2 } from "lucide-react";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";

interface EntityDeleteWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  saving: boolean;
  disabled?: boolean;
  onDelete: () => void;
}

export function EntityDeleteWidgetCard({
  widget,
  entity,
  saving,
  disabled = false,
  onDelete,
}: EntityDeleteWidgetCardProps) {
  return (
    <div className="rounded-2xl border border-[rgba(214,0,0,0.12)] bg-white/50 p-[17px] shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff1b0a] text-white">
            <Trash2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-medium leading-5 text-[#171717]">
            {widget.name}
          </h3>
          <p className="mt-1 text-xs leading-4 text-[#737373]">
            Delete the {entity.type} and all widget-linked data attached to it.
          </p>
        </div>
      </div>

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
    </div>
  );
}
