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

interface WidgetCenterShellRuntimeBridgeProps {
  runtimeState: ShellRuntimeState;
}

const WidgetCenterShellRuntimeBridge = ({
  runtimeState,
}: WidgetCenterShellRuntimeBridgeProps) => {
  const { patchState } = useShellRuntimeActions();

  useEffect(() => {
    patchState(runtimeState);
  }, [patchState, runtimeState]);

  return null;
};

interface WidgetCenterShellInnerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const WidgetCenterShellInner = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: WidgetCenterShellInnerProps) => {
  const { registerScrollContainer } = useShellRuntimeActions();

  const handleScrollContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerScrollContainer(element);
    },
    [registerScrollContainer]
  );

  return (
    <>
      <WidgetCenterShellRuntimeBridge runtimeState={{ title, subtitle }} />
      <ShellSurface
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel="Close widgets"
        closeTooltip="Close Widgets"
        shellClassName="fixed inset-x-3 bottom-3 top-auto z-[90] h-[min(78vh,720px)] pointer-events-none md:inset-x-auto md:right-8 md:top-28 md:bottom-6 md:h-auto md:w-[376px]"
        scrollContainerRef={handleScrollContainerRef}
        bodyClassName="flex-1 overflow-y-auto no-scrollbar px-1 pt-5"
      >
        <WidgetChromeProvider
          currentHost="widget_center"
          hostOptions={getWidgetHostOptions(["widget_center"])}
          hostSelectionDisabled
        >
          <ShellStack>{children}</ShellStack>
        </WidgetChromeProvider>
      </ShellSurface>
    </>
  );
};

interface WidgetCenterShellProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  runtimeState?: ShellRuntimeState;
  children: ReactNode;
}

export const WidgetCenterShell = ({
  shellId,
  isOpen,
  onClose,
  title,
  subtitle,
  runtimeState,
  children,
}: WidgetCenterShellProps) => {
  const initialState = useMemo(() => runtimeState ?? {}, [runtimeState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={initialState}>
      <WidgetCenterShellInner
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
      >
        {children}
      </WidgetCenterShellInner>
    </ShellRuntimeProvider>
  );
};
