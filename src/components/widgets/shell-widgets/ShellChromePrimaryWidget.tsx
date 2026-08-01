import { WIDGET_GLASS } from "@/modules/shell/constants";
import { ChevronLeft, Layers3, X } from "lucide-react";
import { BaseWidget } from "@synarava/shell-kit";
import { LogoMark } from "@synarava/ui-kit";

interface ShellChromePrimaryWidgetProps {
  desktopSidebarVisible: boolean;
  mobileSidebarOpen: boolean;
  onToggleDesktopSidebar: () => void;
  onToggleMobileSidebar: () => void;
  className?: string;
}

export const ShellChromePrimaryWidget = ({
  desktopSidebarVisible,
  mobileSidebarOpen,
  onToggleDesktopSidebar,
  onToggleMobileSidebar,
  className,
}: ShellChromePrimaryWidgetProps) => (
  <>
    <button
      type="button"
      onClick={onToggleDesktopSidebar}
      className={["hidden appearance-none border-0 bg-transparent p-0 text-left md:block", className].filter(Boolean).join(" ")}
      aria-label={desktopSidebarVisible ? "Close layers panel" : "Open layers panel"}
    >
      <BaseWidget {...WIDGET_GLASS}
        dataTestId="top-chrome-hero"
        className="w-[360px]"
        contentPaddingClassName="px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-black/10" />
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Synarava</p>
            <h2 className="mt-1 truncate text-[16px] font-black tracking-tight text-neutral-950">Visit</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70">
            {desktopSidebarVisible ? (
              <ChevronLeft className="h-5 w-5 text-neutral-800" />
            ) : (
              <Layers3 className="h-5 w-5 text-neutral-800" />
            )}
          </div>
        </div>
      </BaseWidget>
    </button>

    <button
      type="button"
      onClick={onToggleMobileSidebar}
      className={["block appearance-none border-0 bg-transparent p-0 text-left md:hidden", className].filter(Boolean).join(" ")}
      aria-label={mobileSidebarOpen ? "Close layers drawer" : "Open layers drawer"}
    >
      <BaseWidget {...WIDGET_GLASS}
        dataTestId="top-chrome-hero"
        className="w-[360px]"
        contentPaddingClassName="px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <LogoMark className="h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-black/10" />
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">Synarava</p>
            <h2 className="mt-1 truncate text-[16px] font-black tracking-tight text-neutral-950">Visit</h2>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70">
            {mobileSidebarOpen ? (
              <X className="h-4 w-4 text-neutral-800" />
            ) : (
              <Layers3 className="h-4 w-4 text-neutral-800" />
            )}
          </div>
        </div>
      </BaseWidget>
    </button>
  </>
);
