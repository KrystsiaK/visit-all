import { Route } from "lucide-react";
import { ShellActionCard } from "@/components/widgets/shell-widgets/actions/ShellActionCard";

interface ShellFinishTraceWidgetProps {
  visible: boolean;
  onFinishTraceDraft: () => void;
}

export const ShellFinishTraceWidget = ({
  visible,
  onFinishTraceDraft,
}: ShellFinishTraceWidgetProps) => {
  if (!visible) {
    return null;
  }

  return (
    <ShellActionCard
      eyebrow="Path Ready"
      title="Finish Path"
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
  );
};
