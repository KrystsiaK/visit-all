"use client";

import { useMemo, type ReactNode } from "react";

import { type ShellRuntimeState } from "@synarava/shell-kit";
import { SideDockShell } from "@/components/shells/SideDockShell";
import { getEntityWidgetHost } from "@/lib/widget-hosts";
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

  return (
    <SideDockShell
      shellId={shellId}
      initialState={runtimeState}
      runtimeState={runtimeState}
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width={376}
      title={title}
      subtitle={subtitle}
      closeLabel="Close entity widgets"
      backdropCloseLabel="Dismiss entity drawer overlay"
      closeTooltip="Close Panel"
      currentHost={widgetHost}
      showHeader={false}
      backdropMode="always"
      stackClassName="pointer-events-auto"
      pinnedChildren={pinnedChildren}
    >
      {children}
    </SideDockShell>
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
  );
};
