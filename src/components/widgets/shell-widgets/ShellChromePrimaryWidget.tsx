import { ChevronLeft, Layers3, X } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { ShellHeroCard } from "@/components/shells/ShellHeroCard";

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
      <ShellHeroCard
        dataTestId="top-chrome-hero"
        eyebrow="Synarava"
        title="Visit"
        className="w-[336px] px-4 py-3"
        accent={<LogoMark className="h-10 w-10 overflow-hidden rounded-xl border border-black/10" />}
        trailing={
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70">
            {desktopSidebarVisible ? (
              <ChevronLeft className="h-5 w-5 text-neutral-800" />
            ) : (
              <Layers3 className="h-5 w-5 text-neutral-800" />
            )}
          </div>
        }
      />
    </button>

    <button
      type="button"
      onClick={onToggleMobileSidebar}
      className={["block appearance-none border-0 bg-transparent p-0 text-left md:hidden", className].filter(Boolean).join(" ")}
      aria-label={mobileSidebarOpen ? "Close layers drawer" : "Open layers drawer"}
    >
      <ShellHeroCard
        dataTestId="top-chrome-hero"
        eyebrow="Synarava"
        title="Visit"
        className="w-[336px] px-4 py-3"
        accent={<LogoMark className="h-8 w-8 overflow-hidden rounded-xl border border-black/10" />}
        trailing={
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70">
            {mobileSidebarOpen ? (
              <X className="h-4 w-4 text-neutral-800" />
            ) : (
              <Layers3 className="h-4 w-4 text-neutral-800" />
            )}
          </div>
        }
      />
    </button>
  </>
);
