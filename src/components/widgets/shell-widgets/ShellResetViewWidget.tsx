import { RotateCcw } from "lucide-react";
import { ShellActionCard } from "@/components/widgets/shell-widgets/actions/ShellActionCard";

interface ShellResetViewWidgetProps {
  onResetView: () => void;
  disabled?: boolean;
}

export const ShellResetViewWidget = ({
  onResetView,
  disabled = false,
}: ShellResetViewWidgetProps) => (
  <ShellActionCard
    eyebrow="Camera"
    title="Reset View"
    icon={<RotateCcw className="h-6 w-6 text-black" />}
    colorBars={
      <div className="grid h-full grid-cols-1 grid-rows-3">
        <div className="bg-[#ff0000]" />
        <div className="bg-[#ffff00]" />
        <div className="bg-[#0000ff]" />
      </div>
    }
    disabled={disabled}
    onClick={onResetView}
  />
);
