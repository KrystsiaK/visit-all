"use client";

import { WIDGET_GLASS } from "@/modules/shell/constants";

import { type ReactNode } from "react";

import { BaseWidget } from "@synarava/shell-kit";

interface ShellActionCtaWidgetProps {
  title: ReactNode;
  icon: ReactNode;
  colorBars: ReactNode;
  tone?: "neutral" | "mist" | "cream" | "rose";
  iconPaneClassName?: string;
  colorPaneWidthClassName?: string;
  iconPaneWidthClassName?: string;
  titlePaneClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ShellActionCtaWidget = ({
  title,
  icon,
  colorBars,
  tone = "cream",
  iconPaneClassName = "bg-white/80",
  colorPaneWidthClassName = "w-[64px]",
  iconPaneWidthClassName = "w-[64px]",
  titlePaneClassName = "px-6",
  disabled = false,
  onClick,
}: ShellActionCtaWidgetProps) => {
  return (
    <BaseWidget {...WIDGET_GLASS}
      title=""
      identityVisibility="settings-only"
      className="group/cta pointer-events-auto block w-full max-w-full overflow-hidden"
      contentPaddingClassName="p-0"
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group relative flex h-[76px] w-full max-w-full overflow-hidden rounded-xl text-left disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className={`relative z-[2] shrink-0 overflow-hidden rounded-l-xl ${colorPaneWidthClassName}`}>
          <div className="absolute inset-0">{colorBars}</div>
        </div>

        <div className={`relative z-[2] flex shrink-0 items-center justify-center border-x border-black/10 ${iconPaneWidthClassName} ${iconPaneClassName}`}>
          <div className="relative z-[1]">{icon}</div>
        </div>

        <div className={`relative z-[2] flex min-w-0 flex-1 items-center overflow-hidden ${titlePaneClassName}`}>
          <div className="relative z-[1] min-w-0 w-full max-w-full">{title}</div>
        </div>
      </button>
    </BaseWidget>
  );
};
