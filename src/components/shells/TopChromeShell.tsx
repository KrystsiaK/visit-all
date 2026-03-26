"use client";

import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";
import type { TopChromeShellInstance } from "@/lib/shells";
import { ShellSurface } from "@/components/shells/ShellSurface";
import { ShellChromePrimaryWidget } from "@/components/widgets/shell-widgets/ShellChromePrimaryWidget";

interface TopChromeShellProps {
  shell: TopChromeShellInstance | null;
  shellWidgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>;
  desktopSidebarVisible: boolean;
  mobileSidebarOpen: boolean;
  shellWidth: number;
  onToggleDesktopSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export function TopChromeShell({
  shell,
  shellWidgets,
  desktopSidebarVisible,
  mobileSidebarOpen,
  shellWidth,
  onToggleDesktopSidebar,
  onToggleMobileSidebar,
}: TopChromeShellProps) {
  if (!shell || shell.state.hidden) {
    return null;
  }

  const primaryWidget = shellWidgets.find((widget) => widget.componentKey === "shell_chrome_primary");

  if (!primaryWidget) {
    return null;
  }

  return (
    <ShellSurface
      isOpen
      onClose={onToggleMobileSidebar}
      title=""
      closeLabel="Close top chrome"
      closeTooltip="Close top chrome"
      showBackdrop={false}
      showHeader={false}
      showCloseButton={false}
      mobileHandle={false}
      shellClassName="fixed left-4 top-4 z-[60] md:left-6 md:top-6"
      surfaceClassName="pointer-events-auto"
      bodyClassName="overflow-visible"
      shellVariants={{
        hidden: { opacity: 0, y: -12, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.98 },
      }}
    >
      <ShellChromePrimaryWidget
        desktopSidebarVisible={desktopSidebarVisible}
        mobileSidebarOpen={mobileSidebarOpen}
        shellWidth={shellWidth}
        onToggleDesktopSidebar={onToggleDesktopSidebar}
        onToggleMobileSidebar={onToggleMobileSidebar}
      />
    </ShellSurface>
  );
}
