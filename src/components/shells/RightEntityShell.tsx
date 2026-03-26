"use client";

import { useEffect, useMemo, type ReactNode } from "react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState } from "@/components/shells/ShellRuntimeProvider";
import { ShellStack } from "@/components/shells/ShellStack";
import { ShellSurface } from "@/components/shells/ShellSurface";
import { WidgetChromeProvider } from "@/components/widgets/WidgetChromeContext";
import { getEntityWidgetHost, getWidgetHostOptions } from "@/lib/widget-hosts";
import type { WidgetEntityType } from "@/lib/widgets";

interface RightEntityShellRuntimeBridgeProps {
  runtimeState: ShellRuntimeState;
}

const RightEntityShellRuntimeBridge = ({
  runtimeState,
}: RightEntityShellRuntimeBridgeProps) => {
  const { patchState } = useShellRuntimeActions();

  useEffect(() => {
    patchState(runtimeState);
  }, [patchState, runtimeState]);

  return null;
};

interface RightEntityShellInnerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  loading: boolean;
  entityType: WidgetEntityType;
  runtimeState: ShellRuntimeState;
  children: ReactNode;
}

const RightEntityShellInner = ({
  isOpen,
  onClose,
  title,
  subtitle,
  loading,
  entityType,
  runtimeState,
  children,
}: RightEntityShellInnerProps) => {
  const { registerScrollContainer } = useShellRuntimeActions();
  const widgetHost = getEntityWidgetHost(entityType);

  return (
    <>
      <RightEntityShellRuntimeBridge runtimeState={runtimeState} />
      <ShellSurface
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel="Close entity widgets"
        closeTooltip="Close Panel"
        shellClassName="fixed inset-x-3 bottom-3 top-auto z-50 h-[min(78vh,720px)] pointer-events-none md:inset-x-auto md:right-8 md:top-28 md:bottom-6 md:h-auto md:w-[376px]"
        scrollContainerRef={registerScrollContainer}
        bodyClassName="flex-1 overflow-y-auto no-scrollbar px-1 pt-5"
        headerMeta={
          loading ? (
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              Loading widgets...
            </p>
          ) : null
        }
      >
        <WidgetChromeProvider
          currentHost={widgetHost}
          hostOptions={getWidgetHostOptions([widgetHost])}
          hostSelectionDisabled
        >
          <ShellStack>{children}</ShellStack>
        </WidgetChromeProvider>
      </ShellSurface>
    </>
  );
};

interface RightEntityShellProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  loading: boolean;
  entityType: WidgetEntityType;
  runtimeState?: ShellRuntimeState;
  children: ReactNode;
}

export const RightEntityShell = ({
  shellId,
  isOpen,
  onClose,
  title,
  subtitle,
  loading,
  entityType,
  runtimeState,
  children,
}: RightEntityShellProps) => {
  const initialState = useMemo(() => runtimeState ?? {}, [runtimeState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={initialState}>
      <RightEntityShellInner
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        loading={loading}
        entityType={entityType}
        runtimeState={runtimeState ?? {}}
      >
        {children}
      </RightEntityShellInner>
    </ShellRuntimeProvider>
  );
};
