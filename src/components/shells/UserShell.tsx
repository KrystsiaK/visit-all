"use client";

import { useCallback, useEffect, useMemo, type ReactNode } from "react";

import {
  ShellRuntimeProvider,
  useShellRuntimeActions,
  type ShellRuntimeState,
} from "@/components/shells/ShellRuntimeProvider";
import { ShellStack } from "@/components/shells/ShellStack";
import { ShellSurface } from "@/components/shells/ShellSurface";
import { WidgetChromeProvider } from "@/components/widgets/WidgetChromeContext";
import { getWidgetHostOptions } from "@/lib/widget-hosts";

const UserShellRuntimeBridge = ({
  runtimeState,
}: {
  runtimeState: ShellRuntimeState;
}) => {
  const { patchState } = useShellRuntimeActions();

  useEffect(() => {
    patchState(runtimeState);
  }, [patchState, runtimeState]);

  return null;
};

const UserShellInner = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}) => {
  const { registerScrollContainer } = useShellRuntimeActions();

  const handleScrollContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerScrollContainer(element);
    },
    [registerScrollContainer]
  );

  return (
    <>
      <UserShellRuntimeBridge runtimeState={{ title, subtitle }} />
      <ShellSurface
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel="Close account shell"
        closeTooltip="Close Account"
        shellClassName="fixed inset-x-3 bottom-3 top-auto z-[90] h-[min(78vh,720px)] pointer-events-none md:inset-x-auto md:right-8 md:top-28 md:bottom-6 md:h-auto md:w-[376px]"
        scrollContainerRef={handleScrollContainerRef}
        bodyClassName="flex-1 overflow-y-auto no-scrollbar px-1 pt-5"
      >
        <WidgetChromeProvider
          currentHost="user_shell"
          hostOptions={getWidgetHostOptions(["user_shell"])}
          hostSelectionDisabled
        >
          <ShellStack>{children}</ShellStack>
        </WidgetChromeProvider>
      </ShellSurface>
    </>
  );
};

export function UserShell({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const initialState = useMemo(
    () => ({
      title: "Account",
      subtitle: "Your identity, verification, and session controls.",
    }),
    []
  );

  return (
    <ShellRuntimeProvider shellId="user_shell" initialState={initialState}>
      <UserShellInner
        isOpen={isOpen}
        onClose={onClose}
        title="Account"
        subtitle="Your identity, verification, and session controls."
      >
        {children}
      </UserShellInner>
    </ShellRuntimeProvider>
  );
}
