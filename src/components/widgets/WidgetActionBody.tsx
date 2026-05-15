"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

interface WidgetActionBodyProps {
  title: string;
  icon: ReactNode;
  colorBars: ReactNode;
  className?: string;
  colorPaneClassName?: string;
  iconPaneWrapClassName?: string;
  iconPaneClassName?: string;
  titlePaneClassName?: string;
  titleClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const WidgetActionBody = ({
  title,
  icon,
  colorBars,
  className,
  colorPaneClassName,
  iconPaneWrapClassName,
  iconPaneClassName,
  titlePaneClassName,
  titleClassName,
  disabled = false,
  onClick,
}: WidgetActionBodyProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "group relative flex h-20 w-full overflow-hidden rounded-2xl text-left",
      disabled && "cursor-not-allowed opacity-60",
      className
    )}
  >
    <div className={cn("w-16 shrink-0", colorPaneClassName)}>{colorBars}</div>
    <div
      className={cn(
        "flex w-16 shrink-0 items-center justify-center border-x border-black/15 bg-white",
        iconPaneWrapClassName,
        iconPaneClassName
      )}
    >
      {icon}
    </div>
    <div className={cn("relative flex min-w-0 flex-1 items-center bg-[#f8f6f1] px-5", titlePaneClassName)}>
      <span
        className={cn(
          "text-[22px] font-black uppercase tracking-tight text-neutral-950",
          titleClassName
        )}
      >
        {title}
      </span>
    </div>
  </button>
);
