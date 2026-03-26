import { Trash2 } from "lucide-react";
import { WidgetActionBody } from "@/components/widgets/WidgetActionBody";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";

interface ShellRemoveTracePointWidgetProps {
  visible: boolean;
  selectedTraceNodeIndex: number | null;
  onRemoveSelectedTraceNode?: () => void;
}

export const ShellRemoveTracePointWidget = ({
  visible,
  selectedTraceNodeIndex,
  onRemoveSelectedTraceNode,
}: ShellRemoveTracePointWidgetProps) => {
  if (!visible) {
    return null;
  }

  const disabled = selectedTraceNodeIndex === null;

  return (
    <WidgetChrome
      eyebrow={disabled ? "Select Point" : `Point ${selectedTraceNodeIndex + 1} Ready`}
      title="Remove Point"
      identityVisibility="settings-only"
      className={disabled
        ? "pointer-events-auto border-black/10 bg-[#ebe8df] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
        : "pointer-events-auto border-[#7d0f1f]/25 bg-[#fff4f4] shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"}
      bodyClassName="p-0"
      contentPaddingClassName="p-0"
    >
      <WidgetActionBody
        title="Remove Point"
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
    </WidgetChrome>
  );
};
