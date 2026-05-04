"use client";

import type { WidgetInstanceRecord, WidgetPlacementRecord } from "@/lib/widgets";
import type { TopChromeShellInstance } from "@/lib/shells";
import { ShellChromePrimaryWidget } from "@/components/widgets/shell-widgets/ShellChromePrimaryWidget";

interface TopChromeShellProps {
  shell: TopChromeShellInstance | null;
  shellWidgets: Array<WidgetPlacementRecord & WidgetInstanceRecord>;
  desktopSidebarVisible: boolean;
  mobileSidebarOpen: boolean;
  onToggleDesktopSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export function TopChromeShell({
  shell,
  shellWidgets,
  desktopSidebarVisible,
  mobileSidebarOpen,
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
    <div className="fixed left-0 top-0 z-[60] md:hidden">
      <ShellChromePrimaryWidget
        desktopSidebarVisible={desktopSidebarVisible}
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleDesktopSidebar={onToggleDesktopSidebar}
        onToggleMobileSidebar={onToggleMobileSidebar}
        className="ml-3 mt-3"
      />
    </div>
  );
}
