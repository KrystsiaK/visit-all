import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);

export const ShellClockWidget = ({
  widget,
  onDelete,
}: {
  widget?: WidgetInstanceRecord;
  onDelete?: () => void;
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <BaseWidget
      dataTestId={widget ? `widget-${widget.id}` : undefined}
      eyebrow="Clock"
      title="Local Time"
      subtitle="One shell, one live clock."
      identityVisibility="settings-only"
      className="pointer-events-auto border-black/10 bg-[#f8f6f1]/80"
      onDelete={onDelete}
    >
      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-black/8 bg-white/62 px-4 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            {formatDate(now)}
          </p>
          <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-neutral-950">
            {formatTime(now)}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#111111] text-white">
          <Clock3 className="h-5 w-5" />
        </div>
      </div>
    </BaseWidget>
  );
};
