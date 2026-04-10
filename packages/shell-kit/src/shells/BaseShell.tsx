"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  type ReactNode,
  type RefCallback,
  type CSSProperties,
} from "react";
import type { Variants } from "framer-motion";

import {
  resolveShellEntrance,
  type ShellEntranceName,
} from "../lib/shell-entrance-presets";

interface BaseShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
  backdropCloseLabel?: string;
  closeButton?: ReactNode;
  children: ReactNode;
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
  mobileHandle?: boolean;
  showBackdrop?: boolean;
  showHeader?: boolean;
  showCloseButton?: boolean;
  /** Named animation preset. Defaults to `"overlay"`. */
  entrance?: ShellEntranceName;
  /** Custom shell variants — overrides `entrance` if provided. */
  shellVariants?: Variants;
  /** Custom section variants — used with `shellVariants`. */
  sectionVariants?: Variants;
  shellInitial?: string;
  shellAnimate?: string;
  shellExit?: string;
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
  scrollContainerRef,
  scrollContainerDataId,
  headerMeta,
  shellStyle,
  shellClassName,
  backdropClassName = "fixed inset-0 bg-black/12 backdrop-blur-[1px] md:hidden",
  surfaceClassName = "h-full pointer-events-auto",
  headerClassName = "rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl",
  bodyClassName = "flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1",
  contentContainerClassName = "flex h-full flex-col gap-3 overflow-hidden md:gap-4 md:py-6",
  mobileHandle = true,
  showBackdrop = true,
  showHeader = true,
  showCloseButton = true,
  entrance,
  shellVariants,
  sectionVariants,
  shellInitial = "hidden",
  shellAnimate = "visible",
  shellExit = "exit",
}: BaseShellProps) => {
  const resolved = resolveShellEntrance(entrance, shellVariants, sectionVariants);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {showBackdrop ? (
            <motion.button
              type="button"
              aria-label={backdropCloseLabel}
              onClick={onClose}
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
            <div className={surfaceClassName}>
              <div className={contentContainerClassName}>
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
                            onClick={onClose}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
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
                  {children}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
