"use client";

import {
  useMemo,
  type ReactNode,
} from "react";

import { type ShellRuntimeState } from "@synarava/shell-kit";
import { SideDockShell } from "@/components/shells/SideDockShell";

interface LeftSidebarShellProps {
  shellId: string;
  isOpen: boolean;
  collapsed?: boolean;
  shellWidth: number;
  initialState: ShellRuntimeState;
  onCloseMobile: () => void;
  pinnedChildren?: ReactNode;
  children: ReactNode;
}

export const LeftSidebarShell = ({
  shellId,
  isOpen,
  collapsed = false,
  shellWidth,
  initialState,
  onCloseMobile,
  pinnedChildren,
  children,
}: LeftSidebarShellProps) => {
  const runtimeInitialState = useMemo(() => initialState, [initialState]);

  return (
    <SideDockShell
      shellId={shellId}
      initialState={runtimeInitialState}
      isOpen={isOpen}
      onClose={onCloseMobile}
      side="left"
      width={shellWidth}
      collapsed={collapsed}
      title=""
      closeLabel="Close layers drawer"
      backdropCloseLabel="Dismiss mobile drawer overlay"
      closeTooltip="Close Layers"
      currentHost="left_sidebar"
      showHeader={false}
      stackClassName="pointer-events-auto"
      stackWrapperClassName="min-h-0"
      stackWrapperStyle={{
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
      pinnedChildren={pinnedChildren}
    >
        {children}
    </SideDockShell>
  );
};
