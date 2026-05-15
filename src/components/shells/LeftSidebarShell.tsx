"use client";

import {
  useMemo,
  type ReactNode,
} from "react";
import type { Variants } from "framer-motion";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState, BaseShell, WidgetProvider } from "@synarava/shell-kit";
import { liquidGlassMotion } from "@synarava/liquid-glass";
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

  const shellClassName = "fixed inset-y-0 left-0 flex w-screen md:w-[var(--dock-width)] max-w-[100vw] flex-col pointer-events-none z-40";
  const isDesktopCollapsed = Boolean(collapsed);

  const shellVariants: Variants = {
    hidden: {
      opacity: 0,
      x: "-106%",
    },
    collapsed: {
      opacity: 1,
      x: "-108%",
      transition: {
        ...liquidGlassMotion.shell,
        duration: 0.38,
        ease: [0.2, 0.9, 0.22, 1],
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        ...liquidGlassMotion.shell,
        duration: 0.38,
        ease: [0.2, 0.9, 0.22, 1],
        when: "beforeChildren",
        staggerChildren: 0.024,
      },
    },
    exit: {
      opacity: 0,
      x: "-104%",
      transition: liquidGlassMotion.exit,
    },
  };

  const sectionVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -18,
    },
    collapsed: {
      opacity: 0.92,
      x: -10,
      transition: {
        ...liquidGlassMotion.section,
        duration: 0.28,
        ease: [0.2, 0.9, 0.22, 1],
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        ...liquidGlassMotion.section,
        duration: 0.28,
        ease: [0.2, 0.9, 0.22, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -12,
      transition: liquidGlassMotion.exit,
    },
  };

  const shellState = collapsed ? "collapsed" : "visible";

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
      shellVariants={shellVariants}
      sectionVariants={sectionVariants}
      shellInitial={isOpen ? shellState : "hidden"}
      shellAnimate={shellState}
      shellStyle={{ ["--dock-width" as string]: `${shellWidth}px` }}
      shellClassName={shellClassName}
      surfaceClassName="h-full pointer-events-auto overflow-visible"
      contentContainerClassName="flex h-full flex-col overflow-visible"
      bodyClassName={isDesktopCollapsed ? "hidden" : "flex h-full min-h-0 flex-col overflow-hidden"}
      scrollContainerRef={registerScrollContainer}
      scrollContainerDataId={shellId}
      pinnedContent={isDesktopCollapsed ? null : pinnedChildren}
      scrollBodyClassName={isDesktopCollapsed ? "hidden" : "min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar"}
      scrollContentClassName={
        isDesktopCollapsed
          ? "hidden"
          : "flex min-h-full w-full flex-col gap-6 px-3 pt-3 pb-8 md:px-3 md:pt-[96px]"
      }
      pinnedClassName="sticky top-3 z-[5] shrink-0"
      childrenClassName={
        isDesktopCollapsed
          ? "hidden"
          : pinnedChildren
            ? "flex w-full flex-col gap-5 pt-4 pointer-events-auto"
            : "flex w-full flex-col gap-5 pointer-events-auto"
      }
      backdropClassName="fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px] md:hidden"
      showBackdrop={true}
    >
      <WidgetProvider
        currentHost="left_sidebar"
        hostOptions={getWidgetHostOptions(["left_sidebar"])}
        hostSelectionDisabled
      >
        {isDesktopCollapsed ? null : (
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
        )}
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
