import { Settings2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { WidgetFrame } from "@/components/widgets/WidgetFrame";

export const ShellHeaderWidget = () => (
  <WidgetFrame
    className="pointer-events-auto border-black/12 bg-[#f8f6f1]/92"
    bodyClassName="flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-black/10 bg-white/70 shadow-sm">
        <div className="bg-[#ff0000]" />
        <div className="bg-[#ffff00]" />
        <div className="bg-[#0000ff]" />
        <div className="bg-[#111111]" />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-500">Synarava</span>
        <span className="text-[18px] font-black tracking-tight text-neutral-900">Visit</span>
      </div>
    </div>
    <Tooltip label="Coming Soon">
      <button disabled className="flex h-8 w-8 items-center justify-center text-neutral-300 opacity-60">
        <Settings2 className="h-4 w-4" />
      </button>
    </Tooltip>
  </WidgetFrame>
);
