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
}: DockedShellProps) => {
  const shellClassName =
    placement === "left"
      ? `fixed inset-y-0 left-4 flex w-[var(--dock-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:left-6 md:max-w-[calc(100vw-3rem)] ${zIndexClassName}`
      : `fixed inset-y-0 right-4 flex w-[var(--dock-width)] max-w-[calc(100vw-2rem)] flex-col pointer-events-none md:right-6 md:max-w-[calc(100vw-3rem)] ${zIndexClassName}`;

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
      surfaceClassName="h-full pointer-events-auto overflow-visible"
      contentContainerClassName="flex h-full flex-col overflow-visible"
      bodyClassName="flex h-full min-h-0 flex-col overflow-hidden"
      scrollContainerRef={scrollContainerRef}
      scrollContainerDataId={scrollContainerDataId}
      pinnedContent={pinnedContent}
      scrollBodyClassName="min-h-0 flex-1 overflow-y-auto overflow-x-visible no-scrollbar"
      scrollContentClassName="flex min-h-full w-full flex-col gap-6 px-3 pt-6 pb-8 md:px-4"
      pinnedClassName="sticky top-6 z-[5] shrink-0"
      childrenClassName={pinnedContent ? "flex w-full flex-col gap-3 pt-4 pointer-events-auto" : "flex w-full flex-col gap-3 pointer-events-auto"}
      backdropClassName={backdropClassName}
    >
      {children}
    </BaseShell>
  );
};
