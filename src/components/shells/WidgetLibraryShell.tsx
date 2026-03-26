"use client";

import { useMemo, type ReactNode } from "react";

import { ShellRuntimeProvider } from "@/components/shells/ShellRuntimeProvider";
import { ShellSurface } from "@/components/shells/ShellSurface";

interface WidgetLibraryShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const WidgetLibraryShell = ({
  isOpen,
  onClose,
  children,
}: WidgetLibraryShellProps) => {
  const initialState = useMemo(
    () => ({
      title: "Widget Library",
      subtitle: "Choose widgets and connect them to shells",
    }),
    []
  );

  return (
    <ShellRuntimeProvider shellId="widget_library_shell" initialState={initialState}>
      <ShellSurface
        isOpen={isOpen}
        onClose={onClose}
        title="Add Widgets"
        subtitle="Choose a widget from the shared library and decide where it should live."
        closeLabel="Close widget library"
        closeTooltip="Close Library"
        mobileHandle={false}
        backdropClassName="fixed inset-0 z-[96] bg-black/20 backdrop-blur-[2px]"
        shellClassName="fixed inset-3 z-[97] pointer-events-none md:inset-6"
        surfaceClassName="h-full pointer-events-auto overflow-hidden rounded-[32px] border border-black/10 bg-white/80 shadow-[0px_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-3xl"
        headerClassName="border-b border-black/8 px-6 py-5 md:px-8"
        bodyClassName="flex-1 overflow-y-auto no-scrollbar px-6 py-6 md:px-8"
      >
        {children}
      </ShellSurface>
    </ShellRuntimeProvider>
  );
};
