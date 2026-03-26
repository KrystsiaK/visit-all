import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

interface ShellActionCardProps {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  colorBars: ReactNode;
  iconPaneClassName?: string;
  frameClassName?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ShellActionCard = ({
  eyebrow,
  title,
  icon,
  colorBars,
  iconPaneClassName,
  frameClassName,
  titleClassName,
  eyebrowClassName,
  disabled = false,
  onClick,
}: ShellActionCardProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "group relative flex h-20 w-full overflow-hidden rounded-2xl border border-black/20 bg-[#f8f6f1] text-left shadow-[0px_10px_28px_rgba(0,0,0,0.14)]",
      disabled && "cursor-not-allowed opacity-60",
      frameClassName
    )}
  >
    <div className="w-16 shrink-0">{colorBars}</div>
    <div className={cn("flex w-16 shrink-0 items-center justify-center border-x border-black/15 bg-white", iconPaneClassName)}>
      {icon}
    </div>
    <div className="relative flex min-w-0 flex-1 flex-col justify-center bg-[#f8f6f1] px-5">
      <span className={cn("text-[10px] font-black uppercase tracking-[0.26em] text-neutral-500", eyebrowClassName)}>
        {eyebrow}
      </span>
      <span className={cn("mt-1 text-[22px] font-black uppercase tracking-tight text-neutral-950", titleClassName)}>
        {title}
      </span>
    </div>
  </button>
);
