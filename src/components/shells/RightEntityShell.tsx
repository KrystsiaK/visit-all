"use client";

import { useEffect, useMemo, type ReactNode } from "react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState, DockedShell, WidgetProvider } from "@synarava/shell-kit";
import { getEntityWidgetHost, getWidgetHostOptions } from "@/lib/widget-hosts";
import type { WidgetEntityType } from "@/lib/widgets";

interface RightEntityShellInnerProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  entityType: WidgetEntityType;
  runtimeState: ShellRuntimeState;
  pinnedChildren?: ReactNode;
  children: ReactNode;
}

const RightEntityShellRuntimeBridge = ({ runtimeState }: { runtimeState: ShellRuntimeState }) => {
  const { patchState } = useShellRuntimeActions();

  useEffect(() => {
    patchState(runtimeState);
  }, [patchState, runtimeState]);

  return null;
};

const RightEntityShellInner = ({
  shellId,
  isOpen,
  onClose,
  title,
  subtitle,
  entityType,
  runtimeState,
  pinnedChildren,
  children,
}: RightEntityShellInnerProps) => {
  const widgetHost = getEntityWidgetHost(entityType);
  const { registerScrollContainer } = useShellRuntimeActions();

  return (
    <>
      <RightEntityShellRuntimeBridge runtimeState={runtimeState} />
      <DockedShell
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel="Close entity widgets"
        backdropCloseLabel="Dismiss entity drawer overlay"
        showHeader={false}
        mobileHandle={false}
        placement="right"
        width={376}
        zIndexClassName="z-50"
        scrollContainerRef={registerScrollContainer}
        scrollContainerDataId={shellId}
        pinnedContent={pinnedChildren}
        backdropClassName="fixed inset-0 z-[48] bg-black/14 backdrop-blur-[1px]"
        showBackdrop={true}
      >
        <WidgetProvider
          currentHost={widgetHost}
          hostOptions={getWidgetHostOptions([widgetHost])}
          hostSelectionDisabled
        >
          {children}
        </WidgetProvider>
      </DockedShell>
    </>
  );
};

interface RightEntityShellProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  entityType: WidgetEntityType;
  runtimeState?: ShellRuntimeState;
  pinnedChildren?: ReactNode;
  children: ReactNode;
}

export const RightEntityShell = ({
  shellId,
  isOpen,
  onClose,
  title,
  subtitle,
  entityType,
  runtimeState,
  pinnedChildren,
  children,
}: RightEntityShellProps) => {
  const initialState = useMemo(() => runtimeState ?? {}, [runtimeState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={initialState}>
      <RightEntityShellInner
        shellId={shellId}
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        entityType={entityType}
        runtimeState={initialState}
        pinnedChildren={pinnedChildren}
      >
        {children}
      </RightEntityShellInner>
    </ShellRuntimeProvider>
  );
};
