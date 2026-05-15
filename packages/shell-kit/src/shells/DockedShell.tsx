"use client";

import type { CSSProperties, ReactNode, RefCallback } from "react";

import { BaseShell } from "./BaseShell";

type DockedPlacement = "left" | "right";

interface DockedShellProps {
  placement: DockedPlacement;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
  backdropCloseLabel?: string;
  closeButton?: ReactNode;
  children: ReactNode;
  pinnedContent?: ReactNode;
  width: number;
  scrollContainerRef?: RefCallback<HTMLDivElement>;
  scrollContainerDataId?: string;
  mobileHandle?: boolean;
  showBackdrop?: boolean;
  showHeader?: boolean;
  showCloseButton?: boolean;
  zIndexClassName?: string;
  backdropClassName?: string;
  shellStyle?: CSSProperties;
  fullWidthOnMobile?: boolean;
  swipeToClose?: boolean;
}

export const DockedShell = ({
  placement,
  isOpen,
  onClose,
  title,
  subtitle,
  closeLabel,
  backdropCloseLabel,
  closeButton,
  children,
  pinnedContent,
  width,
  scrollContainerRef,
  scrollContainerDataId,
  mobileHandle = false,
  showBackdrop = true,
  showHeader = false,
  showCloseButton = true,
  zIndexClassName = "z-50",
  backdropClassName,
  shellStyle,
  fullWidthOnMobile = false,
  swipeToClose = false,
}: DockedShellProps) => {
  const widthClassName =
    fullWidthOnMobile && placement === "right"
      ? "w-screen md:w-[var(--dock-width)]"
      : "w-[var(--dock-width)]";

  const shellClassName =
    placement === "left"
      ? `fixed inset-y-0 left-0 flex ${widthClassName} max-w-[100vw] flex-col pointer-events-none ${zIndexClassName}`
      : `fixed inset-y-0 right-0 flex ${widthClassName} max-w-[100vw] flex-col pointer-events-none ${zIndexClassName}`;

  const mergedShellStyle = {
    ["--dock-width" as string]: `${width}px`,
    ...shellStyle,
  };

  return (
    <BaseShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      closeLabel={closeLabel}
      backdropCloseLabel={backdropCloseLabel}
      closeButton={closeButton}
      placement={placement}
      mobileHandle={mobileHandle}
      showBackdrop={showBackdrop}
      showHeader={showHeader}
      showCloseButton={showCloseButton}
      shellStyle={mergedShellStyle}
      shellClassName={shellClassName}
      surfaceClassName="relative isolate h-full pointer-events-auto overflow-visible [contain:paint] [backface-visibility:hidden] [transform:translateZ(0)]"
      contentContainerClassName="flex h-full flex-col overflow-visible"
      bodyClassName="flex h-full min-h-0 flex-col overflow-hidden"
      scrollContainerRef={scrollContainerRef}
      scrollContainerDataId={scrollContainerDataId}
      pinnedContent={pinnedContent}
      scrollBodyClassName="min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar [will-change:scroll-position]"
      scrollContentClassName="flex min-h-full w-full flex-col gap-6 px-3 pt-3 pb-6 md:px-3 md:pt-3 md:pb-6"
      pinnedClassName="sticky top-3 z-[5] shrink-0"
      childrenClassName={pinnedContent ? "flex w-full flex-col gap-3 pt-12 pointer-events-auto" : "flex w-full flex-col gap-3 pointer-events-auto"}
      backdropClassName={backdropClassName}
      swipeToClose={swipeToClose}
    >
      {children}
    </BaseShell>
  );
};
