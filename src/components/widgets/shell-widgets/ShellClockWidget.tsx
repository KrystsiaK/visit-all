import { WIDGET_GLASS } from "@/modules/shell/constants";
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { useCurrentWidget } from "@/modules/entity/EntityContext";
import { useUserShellActionsIfAvailable } from "@/contexts/user-shell-context";
import { useDestructiveAction, DestructiveActionDialog, IconBadge } from "@synarava/ui-kit";
import type { WidgetInstanceRecord } from "@/lib/widgets";

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { weekday: "short", day: "2-digit", month: "short" }).format(date);

export const ShellClockWidget = ({
  widget: widgetProp,
  onDelete: onDeleteProp,
}: {
  widget?: WidgetInstanceRecord;
  onDelete?: () => void;
}) => {
  const contextWidget = useCurrentWidget();
  const userShellActions = useUserShellActionsIfAvailable();

  const widget = widgetProp ?? contextWidget ?? undefined;
  const rawDelete =
    onDeleteProp ??
    (widget && userShellActions
      ? () => userShellActions.handleRemoveWidget(widget.id)
      : undefined);

  const { trigger: onDelete, dialogProps } = useDestructiveAction(
    rawDelete ?? (() => Promise.resolve()),
    { eyebrow: "Remove Widget", title: "Clock", description: "Remove the clock widget from this shell?", confirmLabel: "Remove" }
  );

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <BaseWidget {...WIDGET_GLASS}
        dataTestId={widget ? `widget-${widget.id}` : undefined}
        eyebrow="Clock"
        title="Local Time"
        subtitle="One shell, one live clock."
        identityVisibility="settings-only"
        className="pointer-events-auto"
        onDelete={rawDelete ? onDelete : undefined}
      >
        <div className="flex items-center justify-between gap-4 rounded-[24px] border border-black/8 bg-white/62 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{formatDate(now)}</p>
            <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-neutral-950">{formatTime(now)}</p>
          </div>
          <IconBadge size="lg">
            <Clock3 className="h-5 w-5" />
          </IconBadge>
        </div>
      </BaseWidget>
      {rawDelete && <DestructiveActionDialog {...dialogProps} />}
    </>
  );
};
