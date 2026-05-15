import { RotateCcw } from "lucide-react";
import { ShellActionCtaWidget, shellActionPaneGlassOverlay } from "@/components/widgets/shell-widgets/ShellActionCtaWidget";

interface ShellResetViewWidgetProps {
  onResetView: () => void;
  disabled?: boolean;
}

export const ShellResetViewWidget = ({
  onResetView,
  disabled = false,
}: ShellResetViewWidgetProps) => (
  <ShellActionCtaWidget
    tone="neutral"
    icon={<RotateCcw className="h-7 w-7 text-black" strokeWidth={2.4} />}
    colorPaneWidthClassName="w-[34px]"
    iconPaneWidthClassName="w-[34px]"
    iconPaneClassName="bg-white/84"
    titlePaneClassName="px-4"
    title={
      <span className="block text-[15px] font-black uppercase leading-[0.88] tracking-[-0.03em] text-neutral-950">
        Reset
        <br />
        View
      </span>
    }
    colorBars={
      <div className="grid h-full grid-rows-3">
        <div className="relative bg-[linear-gradient(180deg,#ff2a1f,#e11408)]">
          <div className="absolute inset-0" style={{ background: shellActionPaneGlassOverlay }} />
        </div>
        <div className="relative bg-[linear-gradient(180deg,#ffe83b,#f2d51a)]">
          <div className="absolute inset-0" style={{ background: shellActionPaneGlassOverlay }} />
        </div>
        <div className="relative bg-[linear-gradient(180deg,#2544ff,#111cc6)]">
          <div className="absolute inset-0" style={{ background: shellActionPaneGlassOverlay }} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px -translate-y-1/2 bg-black/10" />
        <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px -translate-y-1/2 bg-black/10" />
      </div>
    }
    disabled={disabled}
    onClick={onResetView}
  />
);
