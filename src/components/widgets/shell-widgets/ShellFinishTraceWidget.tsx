import { WIDGET_GLASS } from "@/modules/shell/constants";
import { Route } from "lucide-react";
import { WidgetActionBody } from "@synarava/ui-kit";
import { BaseWidget } from "@synarava/shell-kit";
import { useMapMode } from "@/modules/map/MapModeContext";

export const ShellFinishTraceWidget = () => {
  const { mode, drawingPath, traceDraftFinalized, areaDraftFinalized, onFinishTraceDraft, onFinishAreaDraft } = useMapMode();

  const visible =
    (mode === "trace" && drawingPath.length >= 2 && !traceDraftFinalized) ||
    (mode === "area" && drawingPath.length >= 3 && !areaDraftFinalized);

  if (!visible) return null;

  const title = mode === "area" ? "Finish Zone" : "Finish Path";
  const eyebrow = mode === "area" ? "Zone Ready" : "Path Ready";
  const onFinish = mode === "area" ? onFinishAreaDraft : onFinishTraceDraft;

  return (
    <BaseWidget {...WIDGET_GLASS}
      eyebrow={eyebrow}
      title={title}
      identityVisibility="settings-only"
      className="pointer-events-auto"
      bodyClassName="p-0"
      contentPaddingClassName="p-0"
    >
      <WidgetActionBody
        title={title}
        icon={<Route className="h-6 w-6 text-black" />}
        colorBars={
          <div className="flex h-full flex-col">
            <div className="flex-1 bg-[#000000]" />
            <div className="flex-1 bg-[#0000ff]" />
          </div>
        }
        iconPaneClassName="bg-[#f8f6f1]"
        onClick={onFinish}
      />
    </BaseWidget>
  );
};