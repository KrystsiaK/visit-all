import { RotateCcw } from "lucide-react";
import { WidgetActionBody } from "@/components/widgets/WidgetActionBody";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";

interface ShellResetViewWidgetProps {
  onResetView: () => void;
  disabled?: boolean;
}

export const ShellResetViewWidget = ({
  onResetView,
  disabled = false,
}: ShellResetViewWidgetProps) => (
  <WidgetChrome
    eyebrow="Camera"
    title="Reset View"
    identityVisibility="settings-only"
    className="pointer-events-auto border-black/20 bg-[#f8f6f1]/92 shadow-[0px_10px_28px_rgba(0,0,0,0.14)]"
    bodyClassName="p-0"
    contentPaddingClassName="p-0"
  >
    <WidgetActionBody
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
  </WidgetChrome>
);
