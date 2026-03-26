"use client";

import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";
import type { TopChromeShellInstance } from "@/lib/shells";
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
    <div className="fixed left-4 top-4 z-[60] md:left-6 md:top-6">
      <ShellChromePrimaryWidget
        desktopSidebarVisible={desktopSidebarVisible}
        mobileSidebarOpen={mobileSidebarOpen}
        shellWidth={shellWidth}
        onToggleDesktopSidebar={onToggleDesktopSidebar}
        onToggleMobileSidebar={onToggleMobileSidebar}
      />
    </div>
  );
}
