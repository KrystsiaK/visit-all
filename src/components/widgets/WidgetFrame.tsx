import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

interface WidgetFrameProps {
  title?: string;
  eyebrow?: string;
  accent?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function WidgetFrame({
  title,
  eyebrow,
  accent,
  children,
  className,
  bodyClassName,
}: WidgetFrameProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/12 bg-white/72 p-[17px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-2xl [backface-visibility:hidden] [transform:translateZ(0)]",
        className
      )}
    >
      {accent ? <div className="mb-3">{accent}</div> : null}
      {eyebrow || title ? (
        <div className="mb-4">
          {eyebrow ? (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="mt-2 text-sm font-medium leading-5 text-[#171717]">
              {title}
            </h3>
          ) : null}
        </div>
      ) : null}
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}
