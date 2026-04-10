import { Route } from "lucide-react";
import { WidgetActionBody } from "@/components/widgets/WidgetActionBody";
import { BaseWidget } from "@synarava/shell-kit";

interface ShellFinishTraceWidgetProps {
  visible: boolean;
  onFinishTraceDraft: () => void;
  title?: string;
  eyebrow?: string;
}

export const ShellFinishTraceWidget = ({
  visible,
  onFinishTraceDraft,
  title = "Finish Path",
  eyebrow = "Path Ready",
}: ShellFinishTraceWidgetProps) => {
  if (!visible) {
    return null;
  }

  return (
    <BaseWidget
      eyebrow={eyebrow}
      title={title}
      identityVisibility="settings-only"
      className="pointer-events-auto border-black/20 bg-[#f8f6f1]/92 shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
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
        onClick={onFinishTraceDraft}
      />
    </BaseWidget>
  );
};
