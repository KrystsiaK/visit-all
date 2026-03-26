"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/components/ui/utils";

type SurfaceKind = "widget" | "shell" | "map";

interface SurfaceErrorFallbackProps {
  kind: SurfaceKind;
  title?: string;
  body?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const defaults: Record<SurfaceKind, { title: string; body: string }> = {
  widget: {
    title: "Widget Fault",
    body: "This instrument failed, but the rest of the shell is still alive.",
  },
  shell: {
    title: "Shell Fault",
    body: "This shell failed locally. Other surfaces should keep working.",
  },
  map: {
    title: "Map Fault",
    body: "The map surface failed. Shells and widgets can still remain interactive.",
  },
};

const Stripe = () => (
  <div className="flex h-2 overflow-hidden rounded-t-[24px]">
    <div className="flex-1 bg-[#ff0000]" />
    <div className="flex-1 bg-[#ffcf33]" />
    <div className="flex-1 bg-[#111111]" />
  </div>
);

export const SurfaceErrorFallback = ({
  kind,
  title,
  body,
  onRetry,
  className,
  compact = false,
}: SurfaceErrorFallbackProps) => {
  const resolvedTitle = title ?? defaults[kind].title;
  const resolvedBody = body ?? defaults[kind].body;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] border border-[#8a1f1f]/18 bg-[#fff5f3] shadow-[0px_12px_36px_rgba(122,18,18,0.12)]",
        className
      )}
    >
      <Stripe />
      <div className={cn("flex flex-col gap-3 p-4", compact ? "min-h-[96px]" : "min-h-[180px] justify-center")}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#7a1212] text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9a5b4c]">
              Runtime Error
            </p>
            <h3 className="mt-1 text-[20px] font-black uppercase tracking-tight text-[#220909]">
              {resolvedTitle}
            </h3>
            <p className="mt-2 max-w-[32ch] text-sm leading-6 text-[#5f3028]">
              {resolvedBody}
            </p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[#7a1212]/14 bg-white px-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#7a1212] transition-colors hover:bg-[#fff0ec]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
};
