"use client";

import { useCallback, useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import type { Variants } from "framer-motion";
import { X } from "lucide-react";

import { ShellRuntimeProvider, useShellRuntimeActions, type ShellRuntimeState, BaseShell, WidgetProvider } from "@synarava/shell-kit";
import { ShellStack } from "@/components/shells/ShellStack";
import { cn } from "@/components/ui/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { getWidgetHostOptions } from "@/lib/widget-hosts";
import { sidebarShellVariants } from "@/lib/motion";
import type { WidgetHost } from "@/lib/widget-hosts";

type DockSide = "left" | "right";

interface SideDockShellProps {
  shellId: string;
  isOpen: boolean;
  onClose: () => void;
  initialState: ShellRuntimeState;
  runtimeState?: ShellRuntimeState;
  side: DockSide;
  width: number;
  title: string;
  subtitle?: string;
  closeLabel: string;
  backdropCloseLabel?: string;
  closeTooltip: string;
  currentHost: WidgetHost;
  allowedHosts?: WidgetHost[];
  showHeader?: boolean;
  headerMeta?: ReactNode;
  zIndexClassName?: string;
  stackClassName?: string;
  stackWrapperClassName?: string;
  stackWrapperStyle?: CSSProperties;
  pinnedChildren?: ReactNode;
  backdropMode?: "mobile" | "always" | "none";
  collapsed?: boolean;
  children: ReactNode;
}

const SHELL_PINNED_TOP_INSET_CLASS = "pt-6";
const SHELL_PINNED_TOP_OFFSET_CLASS = "top-6";
const SHELL_SECTION_GAP_CLASS = "gap-6";
const SHELL_BOTTOM_BREATHING_CLASS = "pb-8";

const sideSectionVariants = (side: DockSide): Variants => ({
  hidden: {
    opacity: 0,
    x: side === "left" ? -20 : 20,
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
    x: side === "left" ? -12 : 12,
    y: 0,
    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },
});

const sideShellVariants = (side: DockSide): Variants => {
  const visibleTransition =
    sidebarShellVariants.visible && "transition" in sidebarShellVariants.visible
      ? sidebarShellVariants.visible.transition
      : undefined;

  return {
    hidden: {
      opacity: 0,
      x: side === "left" ? "-106%" : "106%",
      y: 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: visibleTransition,
    },
    exit: {
      opacity: 0,
      x: side === "left" ? "-102%" : "102%",
      y: 0,
      transition: {
        duration: 0.16,
        ease: [0.4, 0, 1, 1],
      },
    },
  };
};

const SideDockShellRuntimeBridge = ({
  runtimeState,
}: {
  runtimeState?: ShellRuntimeState;
}) => {
  const { patchState } = useShellRuntimeActions();

  useEffect(() => {
    if (!runtimeState) {
      return;
    }

    patchState(runtimeState);
  }, [patchState, runtimeState]);

  return null;
};

const SideDockShellInner = ({
  shellId,
  isOpen,
  onClose,
  runtimeState,
  side,
  width,
  title,
  subtitle,
  closeLabel,
  backdropCloseLabel,
  closeTooltip,
  currentHost,
  allowedHosts,
  showHeader = true,
  headerMeta,
  zIndexClassName,
  stackClassName,
  stackWrapperClassName,
  stackWrapperStyle,
  pinnedChildren,
  backdropMode = "mobile",
  collapsed = false,
  children,
}: Omit<SideDockShellProps, "initialState">) => {
  const { registerScrollContainer } = useShellRuntimeActions();
  const handleScrollContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerScrollContainer(element);
    },
    [registerScrollContainer]
  );

  const shellClassName = collapsed
    ? side === "left"
      ? `fixed left-4 top-4 flex w-[var(--dock-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:left-6 md:top-6 md:max-w-[calc(100vw-3rem)] ${zIndexClassName ?? "z-40"}`
      : `fixed right-4 top-4 flex w-[var(--dock-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:right-6 md:top-6 md:max-w-[calc(100vw-3rem)] ${zIndexClassName ?? "z-50"}`
    : side === "left"
      ? `fixed inset-y-0 left-4 flex w-[var(--dock-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:left-6 md:max-w-[calc(100vw-3rem)] ${zIndexClassName ?? "z-40"}`
      : `fixed inset-y-0 right-4 flex w-[var(--dock-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:right-6 md:max-w-[calc(100vw-3rem)] ${zIndexClassName ?? "z-50"}`;

  const resolvedBackdropClassName =
    backdropMode === "none"
      ? "hidden"
      : backdropMode === "always"
        ? side === "left"
          ? "fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px]"
          : "fixed inset-0 z-[48] bg-black/14 backdrop-blur-[1px]"
        : side === "left"
          ? "fixed inset-0 z-[35] bg-black/14 backdrop-blur-[1px] md:hidden"
          : "fixed inset-0 z-[48] bg-black/14 backdrop-blur-[1px] md:hidden";

  return (
    <>
      <SideDockShellRuntimeBridge runtimeState={runtimeState} />
      <BaseShell
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        closeLabel={closeLabel}
        backdropCloseLabel={backdropCloseLabel}
        closeButton={
          <Tooltip label={closeTooltip}>
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
              aria-label={closeLabel}
            >
              <X className="h-5 w-5" />
            </button>
          </Tooltip>
        }
        showHeader={showHeader}
        mobileHandle={false}
        shellVariants={sideShellVariants(side)}
        sectionVariants={sideSectionVariants(side)}
        shellStyle={{ ["--dock-width" as string]: `${width}px` }}
        shellClassName={shellClassName}
        surfaceClassName={cn(
          "overflow-visible pointer-events-auto",
          collapsed ? "h-auto" : "h-full"
        )}
        contentContainerClassName={cn(
          "overflow-visible",
          collapsed ? "flex flex-col" : "flex h-full flex-col"
        )}
        bodyClassName={
          collapsed
            ? "overflow-visible"
            : showHeader
            ? "flex flex-1 min-h-0 flex-col overflow-hidden"
            : "flex h-full min-h-0 flex-col overflow-hidden"
        }
        backdropClassName={resolvedBackdropClassName}
        showBackdrop={backdropMode !== "none"}
        headerMeta={headerMeta}
      >
        <WidgetProvider
          currentHost={currentHost}
          hostOptions={getWidgetHostOptions(allowedHosts ?? [currentHost])}
          hostSelectionDisabled
        >
          <div
            className={cn("flex h-full min-h-0 w-full flex-col", stackWrapperClassName)}
            style={stackWrapperStyle}
          >
            {collapsed ? (
              pinnedChildren ? <div>{pinnedChildren}</div> : null
            ) : (
              <div
                ref={handleScrollContainerRef}
                data-shell-scroll-container={shellId}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar"
              >
                <div
                  className={cn(
                    "flex min-h-full w-full flex-col",
                    SHELL_PINNED_TOP_INSET_CLASS,
                    SHELL_SECTION_GAP_CLASS,
                    SHELL_BOTTOM_BREATHING_CLASS
                  )}
                >
                  {pinnedChildren ? (
                    <div className={cn("sticky z-[5] shrink-0", SHELL_PINNED_TOP_OFFSET_CLASS)}>
                      {pinnedChildren}
                    </div>
                  ) : null}
                  <ShellStack className={cn(pinnedChildren && "pt-4", stackClassName)}>
                    {children}
                  </ShellStack>
                </div>
              </div>
            )}
          </div>
        </WidgetProvider>
      </BaseShell>
    </>
  );
};

export const SideDockShell = ({
  shellId,
  initialState,
  ...props
}: SideDockShellProps) => {
  const runtimeInitialState = useMemo(() => initialState, [initialState]);

  return (
    <ShellRuntimeProvider shellId={shellId} initialState={runtimeInitialState}>
      <SideDockShellInner shellId={shellId} {...props} />
    </ShellRuntimeProvider>
  );
};
