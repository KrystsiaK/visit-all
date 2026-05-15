import { NotebookPen } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import type { WidgetInstanceRecord } from "@/lib/widgets";

export const ShellNotesWidget = ({
  widget,
  onDelete,
}: {
  widget?: WidgetInstanceRecord;
  onDelete?: () => void;
}) => {
  return (
    <BaseWidget
      dataTestId={widget ? `widget-${widget.id}` : undefined}
      eyebrow="Notes"
      title="Shell Notes"
      subtitle="Shared scratchpad for shell-level reminders and context."
      identityVisibility="settings-only"
      className="pointer-events-auto border-black/10 bg-[#f8f6f1]/80"
      onDelete={onDelete}
    >
      <div className="flex items-start gap-3 rounded-[24px] border border-dashed border-black/10 bg-white/55 px-4 py-4 text-neutral-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111111] text-white">
          <NotebookPen className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">Shared shell notebook</p>
          <p className="mt-1 text-sm leading-6 text-neutral-600">
            Use this widget for quick shell-level notes, reminders, staging text, or ambient context
            that should stay visible across the application surface.
          </p>
        </div>
      </div>
    </BaseWidget>
  );
};
