import { WIDGET_GLASS } from "@/modules/shell/constants";
import { GeometryDraftActions } from "@synarava/ui-kit";
import { BaseWidget } from "@synarava/shell-kit";
import { useMapMode } from "@/modules/map/MapModeContext";

export const ShellRemoveTracePointWidget = () => {
  const {
    mode,
    drawingPath,
    traceDraftFinalized,
    areaDraftFinalized,
    traceRoutingPending,
    itemLabel,
    onUndoDraft,
    onCancelDraft,
  } = useMapMode();

  const visible =
    (mode === "trace" && drawingPath.length > 0 && !traceDraftFinalized) ||
    (mode === "area" && drawingPath.length > 0 && !areaDraftFinalized);

  if (!visible) return null;

  const title = mode === "area" ? "Edit Zone" : "Edit Path";
  const eyebrow = mode === "area" ? "Draft Controls" : "Path Controls";

  return (
    <BaseWidget {...WIDGET_GLASS}
      eyebrow={eyebrow}
      title={title}
      identityVisibility="settings-only"
      className="pointer-events-auto"
      bodyClassName="p-0"
      contentPaddingClassName="p-0"
    >
      <GeometryDraftActions
        itemLabel={itemLabel}
        canUndo={drawingPath.length > 0}
        disabled={traceRoutingPending}
        onUndo={onUndoDraft}
        onCancel={onCancelDraft}
      />
    </BaseWidget>
  );
};
