"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  type ReactNode,
  type RefCallback,
  type CSSProperties,
} from "react";
import type { Variants } from "framer-motion";

import { Tooltip } from "@/components/ui/Tooltip";
import { overlaySectionVariants, overlayShellVariants } from "@/lib/motion";

interface ShellSurfaceProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
  backdropCloseLabel?: string;
  closeTooltip: string;
  children: ReactNode;
  scrollContainerRef?: RefCallback<HTMLDivElement>;
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
  shellVariants?: Variants;
  sectionVariants?: Variants;
  shellInitial?: string;
  shellAnimate?: string;
  shellExit?: string;
}

export const ShellSurface = ({
  isOpen,
  onClose,
  title,
  subtitle,
  closeLabel,
  backdropCloseLabel = closeLabel,
  closeTooltip,
  children,
  scrollContainerRef,
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
  shellVariants = overlayShellVariants,
  sectionVariants = overlaySectionVariants,
  shellInitial = "hidden",
  shellAnimate = "visible",
  shellExit = "exit",
}: ShellSurfaceProps) => (
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
          variants={shellVariants}
          initial={shellInitial}
          animate={shellAnimate}
          exit={shellExit}
        >
          <div className={surfaceClassName}>
            <div className={contentContainerClassName}>
              {mobileHandle ? (
                <motion.div
                  variants={sectionVariants}
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
                  variants={sectionVariants}
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
                      <Tooltip label={closeTooltip}>
                        <button
                          onClick={onClose}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
                          aria-label={closeLabel}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </Tooltip>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}

              <motion.div
                variants={sectionVariants}
                initial={shellInitial}
                animate={shellAnimate}
                exit={shellExit}
                ref={scrollContainerRef}
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
