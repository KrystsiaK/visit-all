import { WIDGET_GLASS } from "@/modules/shell/constants";
import { NotebookPen } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { useCurrentWidget } from "@/modules/entity/EntityContext";
import { useUserShellActionsIfAvailable } from "@/contexts/user-shell-context";
import { useDestructiveAction, DestructiveActionDialog, InfoCard } from "@synarava/ui-kit";
import type { WidgetInstanceRecord } from "@/lib/widgets";

export const ShellNotesWidget = ({
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
    {
      eyebrow: "Remove Widget",
      title: "Shell Notes",
      description: "Remove the notes widget from this shell?",
      confirmLabel: "Remove",
    }
  );

  return (
    <>
      <BaseWidget {...WIDGET_GLASS}
        dataTestId={widget ? `widget-${widget.id}` : undefined}
        eyebrow="Notes"
        title="Shell Notes"
        subtitle="Shared scratchpad for shell-level reminders and context."
        identityVisibility="settings-only"
        className="pointer-events-auto"
        onDelete={rawDelete ? onDelete : undefined}
      >
        <InfoCard
          icon={<NotebookPen className="h-4 w-4" />}
          title="Shared shell notebook"
          description="Use this widget for quick shell-level notes, reminders, staging text, or ambient context that should stay visible across the application surface."
        />
      </BaseWidget>
      {rawDelete && <DestructiveActionDialog {...dialogProps} />}
    </>
  );
};
