"use client";

import {
  useMemo,
  type ReactNode,
} from "react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState, BaseShell, WidgetProvider } from "@synarava/shell-kit";
import { getWidgetHostOptions } from "@/lib/widget-hosts";

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

const LeftSidebarShellInner = ({
  shellId,
  isOpen,
  collapsed,
  shellWidth,
  onCloseMobile,
  pinnedChildren,
  children,
}: Omit<LeftSidebarShellProps, "initialState">) => {
  const { registerScrollContainer } = useShellRuntimeActions();

  const shellClassName = collapsed
    ? "fixed left-0 top-0 flex w-[var(--dock-width)] max-w-[100vw] flex-col pointer-events-none z-40"
    : "fixed inset-y-0 left-0 flex w-[var(--dock-width)] max-w-[100vw] flex-col pointer-events-none z-40";

  if (collapsed) {
    return (
      <BaseShell
        isOpen={isOpen}
        onClose={onCloseMobile}
        title=""
        closeLabel="Close layers drawer"
        backdropCloseLabel="Dismiss mobile drawer overlay"
        showHeader={false}
        mobileHandle={false}
        placement="left"
        shellStyle={{ ["--dock-width" as string]: `${shellWidth}px` }}
        shellClassName={shellClassName}
        surfaceClassName="h-auto pointer-events-auto overflow-visible"
        contentContainerClassName="flex flex-col overflow-visible"
        bodyClassName="overflow-visible"
        backdropClassName="fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px] md:hidden"
        showBackdrop={true}
      >
        <WidgetProvider
          currentHost="left_sidebar"
          hostOptions={getWidgetHostOptions(["left_sidebar"])}
          hostSelectionDisabled
        >
          <div
            className="flex h-full min-h-0 w-full flex-col"
            style={{
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
          >
            {pinnedChildren ? <div>{pinnedChildren}</div> : null}
          </div>
        </WidgetProvider>
      </BaseShell>
    );
  }

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={onCloseMobile}
      title=""
      closeLabel="Close layers drawer"
      backdropCloseLabel="Dismiss mobile drawer overlay"
      showHeader={false}
      mobileHandle={false}
      placement="left"
      shellStyle={{ ["--dock-width" as string]: `${shellWidth}px` }}
      shellClassName={shellClassName}
      surfaceClassName="h-full pointer-events-auto overflow-visible"
      contentContainerClassName="flex h-full flex-col overflow-visible"
      bodyClassName="flex h-full min-h-0 flex-col overflow-hidden"
      scrollContainerRef={registerScrollContainer}
      scrollContainerDataId={shellId}
      pinnedContent={pinnedChildren}
      scrollBodyClassName="min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar"
      scrollContentClassName="flex min-h-full w-full flex-col gap-6 px-3 pt-6 pb-8 md:px-4"
      pinnedClassName="sticky top-6 z-[5] shrink-0"
      childrenClassName={pinnedChildren ? "flex w-full flex-col gap-3 pt-4 pointer-events-auto" : "flex w-full flex-col gap-3 pointer-events-auto"}
      backdropClassName="fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px] md:hidden"
      showBackdrop={true}
    >
      <WidgetProvider
        currentHost="left_sidebar"
        hostOptions={getWidgetHostOptions(["left_sidebar"])}
        hostSelectionDisabled
      >
        <div
          className="flex h-full min-h-0 w-full flex-col"
          style={{
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          {children}
        </div>
      </WidgetProvider>
    </BaseShell>
  );
};

export const LeftSidebarShell = ({
  shellId,
  initialState,
  ...props
}: LeftSidebarShellProps) => {
  const runtimeInitialState = useMemo(() => initialState, [initialState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={runtimeInitialState}>
      <LeftSidebarShellInner shellId={shellId} {...props} />
    </ShellRuntimeProvider>
  );
};
