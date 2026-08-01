import { RotateCcw } from "lucide-react";
import { ShellActionCtaWidget } from "@/components/widgets/shell-widgets/ShellActionCtaWidget";
import { useMapControls } from "@/contexts/map-controls-context";

export const ShellResetViewWidget = () => {
  const { onResetView, disabled } = useMapControls();

  return (
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
          <div className="bg-[linear-gradient(180deg,#ff2a1f,#e11408)]" />
          <div className="bg-[linear-gradient(180deg,#ffe83b,#f2d51a)]" />
          <div className="bg-[linear-gradient(180deg,#2544ff,#111cc6)]" />
          <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px -translate-y-1/2 bg-black/10" />
          <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px -translate-y-1/2 bg-black/10" />
        </div>
      }
      disabled={disabled}
      onClick={onResetView}
    />
  );
};