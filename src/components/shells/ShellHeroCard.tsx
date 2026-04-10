"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

interface ShellHeroCardProps {
  eyebrow: string;
  title: string;
  titleContent?: ReactNode;
  subtitle?: string;
  accent: ReactNode;
  trailing?: ReactNode;
  className?: string;
  dataTestId?: string;
}

export function ShellHeroCard({
  eyebrow,
  title,
  titleContent,
  subtitle,
  accent,
  trailing,
  className,
  dataTestId,
}: ShellHeroCardProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn(
        "w-full rounded-2xl border border-black/12 bg-white/72 px-[17px] py-[17px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-2xl",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">{accent}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-neutral-500">
            {eyebrow}
          </p>
          {titleContent ? (
            <div className="mt-1">{titleContent}</div>
          ) : (
            <h2 className="mt-1 truncate text-[16px] font-black tracking-tight text-neutral-950">
              {title}
            </h2>
          )}
          {subtitle ? (
            <p className="mt-1 truncate text-sm leading-5 text-[#737373]">{subtitle}</p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </div>
  );
}
