"use client";

import {
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState } from "@/components/shells/ShellRuntimeProvider";
import { ShellStack } from "@/components/shells/ShellStack";
import { ShellSurface } from "@/components/shells/ShellSurface";
import { WidgetChromeProvider } from "@/components/widgets/WidgetChromeContext";
import { getWidgetHostOptions } from "@/lib/widget-hosts";
import { sidebarShellVariants } from "@/lib/motion";
import type { Variants } from "framer-motion";

interface LeftSidebarShellProps {
  shellId: string;
  isOpen: boolean;
  shellWidth: number;
  initialState: ShellRuntimeState;
  onCloseMobile: () => void;
  children: ReactNode;
}

const sidebarSurfaceSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    y: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -12,
    y: 0,
    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },
};

const LeftSidebarShellInner = ({
  isOpen,
  shellWidth,
  onCloseMobile,
  children,
}: Omit<LeftSidebarShellProps, "shellId" | "initialState">) => {
  const { registerScrollContainer } = useShellRuntimeActions();

  const handleScrollContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerScrollContainer(element);
    },
    [registerScrollContainer]
  );

  return (
    <ShellSurface
      isOpen={isOpen}
      onClose={onCloseMobile}
      title=""
      closeLabel="Close layers drawer"
      backdropCloseLabel="Dismiss mobile drawer overlay"
      closeTooltip="Close Layers"
      showHeader={false}
      mobileHandle={false}
      shellVariants={sidebarShellVariants}
      sectionVariants={sidebarSurfaceSectionVariants}
      shellStyle={{ ["--sidebar-width" as string]: `${shellWidth}px` }}
      shellClassName="fixed inset-y-0 left-4 z-40 flex w-[var(--sidebar-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:left-6 md:max-w-[calc(100vw-3rem)]"
      surfaceClassName="h-full overflow-visible pointer-events-auto"
      bodyClassName="flex h-full flex-col overflow-y-auto overflow-x-visible no-scrollbar pt-7 pb-7"
      contentContainerClassName="flex h-full flex-col overflow-visible"
      backdropClassName="fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px] md:hidden"
      scrollContainerRef={handleScrollContainerRef}
    >
      <WidgetChromeProvider
        currentHost="left_sidebar"
        hostOptions={getWidgetHostOptions(["left_sidebar"])}
        hostSelectionDisabled
      >
        <div
          className="flex w-full min-h-max flex-col"
          style={{
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          <ShellStack className="pointer-events-auto">
            {children}
          </ShellStack>
        </div>
      </WidgetChromeProvider>
    </ShellSurface>
  );
};

export const LeftSidebarShell = ({
  shellId,
  isOpen,
  shellWidth,
  initialState,
  onCloseMobile,
  children,
}: LeftSidebarShellProps) => {
  const runtimeInitialState = useMemo(() => initialState, [initialState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={runtimeInitialState}>
      <LeftSidebarShellInner
        isOpen={isOpen}
        shellWidth={shellWidth}
        onCloseMobile={onCloseMobile}
      >
        {children}
      </LeftSidebarShellInner>
    </ShellRuntimeProvider>
  );
};
