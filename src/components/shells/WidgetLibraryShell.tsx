"use client";

import { useMemo, type ReactNode } from "react";
import { X } from "lucide-react";

import { ShellRuntimeProvider, BaseShell } from "@synarava/shell-kit";
import { Tooltip } from "@/components/ui/Tooltip";

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
      <BaseShell
        isOpen={isOpen}
        onClose={onClose}
        title="Add Widgets"
        subtitle="Choose a widget from the shared library and decide where it should live."
        closeLabel="Close widget library"
        closeButton={
          <Tooltip label="Close Library">
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
              aria-label="Close widget library"
            >
              <X className="h-5 w-5" />
            </button>
          </Tooltip>
        }
        mobileHandle={false}
        backdropClassName="fixed inset-0 z-[96] bg-black/20 backdrop-blur-[2px]"
        shellClassName="fixed inset-3 z-[97] pointer-events-none md:inset-6"
        surfaceClassName="h-full pointer-events-auto overflow-hidden rounded-[32px] border border-black/10 bg-white/80 shadow-[0px_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-3xl"
        headerClassName="border-b border-black/8 px-6 py-5 md:px-8"
        bodyClassName="flex-1 overflow-y-auto no-scrollbar px-6 py-6 md:px-8"
      >
        {children}
      </BaseShell>
    </ShellRuntimeProvider>
  );
};
