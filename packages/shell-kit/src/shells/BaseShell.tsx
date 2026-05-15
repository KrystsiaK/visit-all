"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  type ReactNode,
  type RefCallback,
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Variants } from "framer-motion";

import {
  resolveShellEntrance,
  entranceFromPlacement,
  type ShellEntranceName,
  type ShellPlacement,
} from "../lib/shell-entrance-presets";
import { GlassFilterDefs, getLiquidGlassClassName } from "@synarava/liquid-glass";

interface BaseShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
  backdropCloseLabel?: string;
  closeButton?: ReactNode;
  children: ReactNode;
  pinnedContent?: ReactNode;
  scrollContainerRef?: RefCallback<HTMLDivElement>;
  scrollContainerDataId?: string;
  headerMeta?: ReactNode;
  shellStyle?: CSSProperties;
  shellClassName: string;
  backdropClassName?: string;
  surfaceClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  contentContainerClassName?: string;
  scrollBodyClassName?: string;
  scrollContentClassName?: string;
  pinnedClassName?: string;
  childrenClassName?: string;
  mobileHandle?: boolean;
  showBackdrop?: boolean;
  showHeader?: boolean;
  showCloseButton?: boolean;
  /** Where the shell lives — drives the entrance animation automatically. */
  placement?: ShellPlacement;
  /** Named animation preset. Overrides `placement` when provided. */
  entrance?: ShellEntranceName;
  /** Custom shell variants — overrides `entrance` if provided. */
  shellVariants?: Variants;
  /** Custom section variants — used with `shellVariants`. */
  sectionVariants?: Variants;
  shellInitial?: string;
  shellAnimate?: string;
  shellExit?: string;
  swipeToClose?: boolean;
}

export const BaseShell = ({
  isOpen,
  onClose,
  title,
  subtitle,
  closeLabel,
  backdropCloseLabel = closeLabel,
  closeButton,
  children,
  pinnedContent,
  scrollContainerRef,
  scrollContainerDataId,
  headerMeta,
  shellStyle,
  shellClassName,
  backdropClassName = "fixed inset-0 bg-black/12 backdrop-blur-[1px] md:hidden",
  surfaceClassName = "relative isolate h-full overflow-hidden rounded-[32px] pointer-events-auto",
  headerClassName = getLiquidGlassClassName("widget", "neutral", "rounded-[28px] p-6"),
  bodyClassName = "flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1",
  contentContainerClassName = "flex h-full flex-col gap-3 overflow-hidden md:gap-4 md:py-6",
  scrollBodyClassName = "min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar",
  scrollContentClassName = "flex min-h-full w-full flex-col gap-6 pt-6 pb-8",
  pinnedClassName = "sticky top-6 z-[5] shrink-0",
  childrenClassName = pinnedContent
    ? "flex w-full flex-col gap-3 pt-4 pointer-events-auto"
    : "flex w-full flex-col gap-3 pointer-events-auto",
  mobileHandle = true,
  showBackdrop = true,
  showHeader = true,
  showCloseButton = true,
  placement,
  entrance,
  shellVariants,
  sectionVariants,
  shellInitial = "hidden",
  shellAnimate = "visible",
  shellExit = "exit",
  swipeToClose = false,
}: BaseShellProps) => {
  const resolvedEntrance = entrance ?? (placement ? entranceFromPlacement(placement) : undefined);
  const resolved = resolveShellEntrance(resolvedEntrance, shellVariants, sectionVariants);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeTransitionActive, setSwipeTransitionActive] = useState(false);
  const swipeSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    active: boolean;
    lockedAxis: "x" | "y" | null;
    startedAt: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const swipeEnabled = swipeToClose && placement === "right" && isMobileViewport;
  const swipeThreshold = 96;
  const swipeVelocityThreshold = 0.55;

  const surfaceTransform = useMemo(() => {
    if (!swipeEnabled || swipeOffset <= 0) {
      return undefined;
    }

    return `translate3d(${swipeOffset}px, 0, 0)`;
  }, [swipeEnabled, swipeOffset]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeEnabled) {
      return;
    }

    swipeSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: true,
      lockedAxis: null,
      startedAt: event.timeStamp,
    };
    setSwipeTransitionActive(false);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipeSession = swipeSessionRef.current;
    if (!swipeEnabled || !swipeSession || !swipeSession.active || swipeSession.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - swipeSession.startX;
    const deltaY = event.clientY - swipeSession.startY;

    if (!swipeSession.lockedAxis) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        return;
      }

      swipeSession.lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
    }

    if (swipeSession.lockedAxis !== "x") {
      swipeSession.active = false;
      return;
    }

    if (deltaX <= 0) {
      setSwipeOffset(0);
      return;
    }

    setSwipeOffset(deltaX);
  };

  const completeSwipeSession = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipeSession = swipeSessionRef.current;
    if (!swipeEnabled || !swipeSession || swipeSession.pointerId !== event.pointerId) {
      return;
    }

    swipeSessionRef.current = null;

    if (swipeSession.lockedAxis !== "x") {
      setSwipeOffset(0);
      return;
    }

    const elapsedMs = Math.max(event.timeStamp - swipeSession.startedAt, 1);
    const velocityX = swipeOffset / elapsedMs;

    if (swipeOffset >= swipeThreshold || velocityX >= swipeVelocityThreshold) {
      handleClose();
      return;
    }

    setSwipeTransitionActive(true);
    setSwipeOffset(0);
    window.setTimeout(() => setSwipeTransitionActive(false), 220);
  };

  const handleClose = () => {
    swipeSessionRef.current = null;
    setSwipeOffset(0);
    setSwipeTransitionActive(false);
    onClose();
  };

  return (
    <>
      <GlassFilterDefs />
      <AnimatePresence>
        {isOpen ? (
          <>
          {showBackdrop ? (
            <motion.button
              type="button"
              aria-label={backdropCloseLabel}
              onClick={handleClose}
              className={backdropClassName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}

          <motion.div
            className={shellClassName}
            style={shellStyle}
            variants={resolved.shell}
            initial={shellInitial}
            animate={shellAnimate}
            exit={shellExit}
          >
            <div
              className={surfaceClassName}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={completeSwipeSession}
              onPointerCancel={completeSwipeSession}
              style={{
                transform: surfaceTransform,
                transition: swipeTransitionActive ? "transform 220ms cubic-bezier(0.22, 0.9, 0.24, 1)" : undefined,
                touchAction: swipeEnabled ? "pan-y" : undefined,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] [isolation:isolate]"
                style={{
                  backdropFilter: "blur(3px) saturate(155%)",
                  WebkitBackdropFilter: "blur(3px) saturate(155%)",
                  filter: "url(#lg-glass-pill)",
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
                style={{ background: "rgba(255,255,255,0.14)" }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
                style={{
                  background:
                    "radial-gradient(120% 70% at 18% 0%, rgba(255,255,255,0.26), rgba(255,255,255,0.05) 38%, rgba(255,255,255,0) 72%), radial-gradient(110% 90% at 82% 100%, rgba(255,255,255,0.12), rgba(255,255,255,0) 62%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] bg-[radial-gradient(78%_24%_at_50%_0%,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0)_76%)]" />

              <div className={`${contentContainerClassName} relative z-[3]`}>
                {mobileHandle ? (
                  <motion.div
                    variants={resolved.section}
                    initial={shellInitial}
                    animate={shellAnimate}
                    exit={shellExit}
                    className="flex justify-center md:hidden"
                  >
                    <div className="h-1.5 w-14 rounded-full bg-black/12" />
                  </motion.div>
                ) : null}

                {showHeader ? (
                  <motion.div
                    variants={resolved.section}
                    initial={shellInitial}
                    animate={shellAnimate}
                    exit={shellExit}
                    className={headerClassName}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-[24px] font-semibold leading-8 tracking-tight text-[#171717]">
                          {title}
                        </h2>
                        {subtitle ? (
                          <p className="mt-1 text-sm leading-5 text-[#737373]">{subtitle}</p>
                        ) : null}
                        {headerMeta}
                      </div>
                      {showCloseButton ? (
                        closeButton ?? (
                          <button
                            onClick={handleClose}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-[rgba(132,150,182,0.96)] transition-colors hover:bg-white/14"
                            aria-label={closeLabel}
                          >
                            ✕
                          </button>
                        )
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}

                <motion.div
                  variants={resolved.section}
                  initial={shellInitial}
                  animate={shellAnimate}
                  exit={shellExit}
                  ref={scrollContainerRef}
                  data-shell-scroll-container={scrollContainerDataId}
                  className={bodyClassName}
                >
                  <div className={scrollBodyClassName}>
                    <div className={scrollContentClassName}>
                      {pinnedContent ? (
                        <div className={pinnedClassName}>{pinnedContent}</div>
                      ) : null}
                      <div className={childrenClassName}>{children}</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
};
