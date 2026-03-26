import { ChevronLeft, Layers3, X } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";

interface ShellChromePrimaryWidgetProps {
  desktopSidebarVisible: boolean;
  mobileSidebarOpen: boolean;
  shellWidth: number;
  onToggleDesktopSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export const ShellChromePrimaryWidget = ({
  desktopSidebarVisible,
  mobileSidebarOpen,
  shellWidth,
  onToggleDesktopSidebar,
  onToggleMobileSidebar,
}: ShellChromePrimaryWidgetProps) => (
  <>
    <button
      type="button"
      onClick={onToggleDesktopSidebar}
      className="hidden w-full items-center gap-3 overflow-hidden rounded-2xl border border-black/12 bg-white/72 px-[17px] py-[17px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-2xl [backface-visibility:hidden] [transform:translateZ(0)] md:flex"
      style={{ width: `${shellWidth}px` }}
      aria-label={desktopSidebarVisible ? "Close layers panel" : "Open layers panel"}
    >
      <LogoMark className="h-10 w-10 overflow-hidden rounded-xl border border-black/10" />
      <div className="flex flex-col items-start justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Synarava</span>
        <span className="text-[16px] font-black tracking-tight text-neutral-950">Visit</span>
      </div>
      <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70">
        {desktopSidebarVisible ? (
          <ChevronLeft className="h-5 w-5 text-neutral-800" />
        ) : (
          <Layers3 className="h-5 w-5 text-neutral-800" />
        )}
      </div>
    </button>

    <button
      type="button"
      onClick={onToggleMobileSidebar}
      className="flex h-14 items-center gap-3 overflow-hidden rounded-2xl border border-black/12 bg-white/72 px-4 shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-2xl [backface-visibility:hidden] [transform:translateZ(0)] md:hidden"
      aria-label={mobileSidebarOpen ? "Close layers drawer" : "Open layers drawer"}
    >
      <LogoMark className="h-8 w-8 overflow-hidden rounded-xl border border-black/10" />
      <div className="flex flex-col items-start justify-center">
        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-neutral-500">Synarava</span>
        <span className="text-[16px] font-black tracking-tight text-neutral-950">Visit</span>
      </div>
      <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70">
        {mobileSidebarOpen ? (
          <X className="h-4 w-4 text-neutral-800" />
        ) : (
          <Layers3 className="h-4 w-4 text-neutral-800" />
        )}
      </div>
    </button>
  </>
);
