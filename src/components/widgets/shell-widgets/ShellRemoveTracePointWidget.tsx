import { Trash2 } from "lucide-react";
import { ShellActionCard } from "@/components/widgets/shell-widgets/actions/ShellActionCard";

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
    <ShellActionCard
      eyebrow={disabled ? "Select Point" : `Point ${selectedTraceNodeIndex + 1} Ready`}
      title="Remove Point"
      icon={<Trash2 className={disabled ? "h-6 w-6 text-neutral-400" : "h-6 w-6 text-[#7d0f1f]"} />}
      colorBars={
        <div className="flex h-full flex-col">
          <div className="flex-1 bg-[#111111]" />
          <div className="flex-1 bg-[#ff0000]" />
        </div>
      }
      frameClassName={disabled ? "border-black/10 bg-[#ebe8df]" : "border-[#7d0f1f]/25 bg-[#fff4f4]"}
      iconPaneClassName={disabled ? "border-black/10 bg-[#fdf8f6]" : "border-black/10 bg-[#fdf8f6]"}
      titleClassName={disabled ? "text-neutral-400" : "text-[#7d0f1f]"}
      disabled={disabled}
      onClick={() => onRemoveSelectedTraceNode?.()}
    />
  );
};
