import { Trash2 } from "lucide-react";
import { WidgetActionBody } from "@/components/widgets/WidgetActionBody";
import { BaseWidget } from "@synarava/shell-kit";

interface ShellRemoveTracePointWidgetProps {
  visible: boolean;
  selectedTraceNodeIndex: number | null;
  onRemoveSelectedTraceNode?: () => void;
  title?: string;
  readyEyebrow?: (index: number) => string;
  idleEyebrow?: string;
}

export const ShellRemoveTracePointWidget = ({
  visible,
  selectedTraceNodeIndex,
  onRemoveSelectedTraceNode,
  title = "Remove Point",
  readyEyebrow = (index) => `Point ${index + 1} Ready`,
  idleEyebrow = "Select Point",
}: ShellRemoveTracePointWidgetProps) => {
  if (!visible) {
    return null;
  }

  const disabled = selectedTraceNodeIndex === null;

  return (
    <BaseWidget
      eyebrow={disabled ? idleEyebrow : readyEyebrow(selectedTraceNodeIndex)}
      title={title}
      identityVisibility="settings-only"
      className={disabled
        ? "pointer-events-auto border-black/10 bg-[#ebe8df] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
        : "pointer-events-auto border-[#7d0f1f]/25 bg-[#fff4f4] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"}
      bodyClassName="p-0"
      contentPaddingClassName="p-0"
    >
      <WidgetActionBody
        title={title}
        icon={<Trash2 className={disabled ? "h-6 w-6 text-neutral-400" : "h-6 w-6 text-[#7d0f1f]"} />}
        colorBars={
          <div className="flex h-full flex-col">
            <div className="flex-1 bg-[#111111]" />
            <div className="flex-1 bg-[#ff0000]" />
          </div>
        }
        iconPaneClassName="border-black/10 bg-[#fdf8f6]"
        titleClassName={disabled ? "text-neutral-400" : "text-[#7d0f1f]"}
        disabled={disabled}
        onClick={() => onRemoveSelectedTraceNode?.()}
      />
    </BaseWidget>
  );
};
