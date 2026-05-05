"use client";

import { motion } from "framer-motion";
import { useCallback, useState, type ReactNode } from "react";
import { GlassFilterDefs } from "@synarava/liquid-glass";

import { cn } from "../lib/cn";

const PILL_EXPAND_MAX = 480;

function useHoverExpand() {
  const [hovered, setHovered] = useState(false);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  return {
    hovered,
    onEnter,
    onLeave,
  };
}

interface TitlePillTextRowProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

function TitlePillTextRow({
  eyebrow,
  title,
  subtitle,
}: TitlePillTextRowProps) {
  const summary = [title, subtitle].filter(Boolean).join(" ");

  return (
    <div className="relative z-1 flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
      {eyebrow ? (
        <span
          className="shrink-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.18em]"
          style={{
            color: "rgba(104, 120, 148, 0.92)",
          }}
        >
          {eyebrow}
        </span>
      ) : null}
      {summary ? (
        <span
          className="min-w-0 truncate whitespace-nowrap text-xs font-semibold"
          style={{
            color: "rgba(132, 150, 182, 0.96)",
          }}
        >
          {summary}
        </span>
      ) : null}
    </div>
  );
}

interface TitlePillProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  expandedMaxWidth?: number | string;
}

export function TitlePill({
  eyebrow,
  title,
  subtitle,
  className,
  expandedMaxWidth = PILL_EXPAND_MAX,
}: TitlePillProps) {
  const { hovered, onEnter, onLeave } = useHoverExpand();

  if (!eyebrow && !title && !subtitle) {
    return null;
  }

  return (
    <>
      <GlassFilterDefs />
      <motion.div
        onHoverStart={onEnter}
        onHoverEnd={onLeave}
        animate={{
          padding: hovered ? "0.5rem 0.95rem" : "0.375rem 0.75rem",
          borderRadius: "999px",
          boxShadow: hovered
            ? "0 8px 26px rgba(0,0,0,0.18)"
            : "0 6px 18px rgba(0,0,0,0.14)",
        }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 2.2] }}
        className={cn(
          "pointer-events-auto relative inline-flex items-center overflow-hidden rounded-full",
          "origin-left transition-[max-width] duration-420 ease-[cubic-bezier(0.23,1,0.32,1)]",
          hovered ? "z-10" : "",
          className,
        )}
        style={{ maxWidth: hovered ? expandedMaxWidth : "100%" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full [isolation:isolate]"
          style={{
            backdropFilter: "blur(3px) saturate(155%)",
            WebkitBackdropFilter: "blur(3px) saturate(155%)",
            filter: "url(#lg-glass-pill)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "rgba(255,255,255,0.14)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] rounded-full"
          style={{
            background:
              "radial-gradient(120% 70% at 18% 0%, rgba(255,255,255,0.26), rgba(255,255,255,0.05) 38%, rgba(255,255,255,0) 72%), radial-gradient(110% 90% at 82% 100%, rgba(255,255,255,0.12), rgba(255,255,255,0) 62%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] rounded-full bg-[radial-gradient(78%_24%_at_50%_0%,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0)_76%)]" />
        <div
          className="relative z-[3] flex min-w-0 flex-1 items-center overflow-hidden"
          style={{ color: "rgba(228, 234, 244, 0.94)" }}
        >
          <TitlePillTextRow
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
          />
        </div>
      </motion.div>
    </>
  );
}

interface CompactTitlePillProps {
  label: string;
  icon?: ReactNode;
  className?: string;
  expandedMaxWidth?: number | string;
}

export function CompactTitlePill({
  label,
  icon,
  className,
  expandedMaxWidth = PILL_EXPAND_MAX,
}: CompactTitlePillProps) {
  const { hovered, onEnter, onLeave } = useHoverExpand();

  return (
    <>
      <GlassFilterDefs />
      <motion.div
        onHoverStart={onEnter}
        onHoverEnd={onLeave}
        animate={{
          padding: hovered ? "0.5rem 0.95rem" : "0.375rem 0.75rem",
          borderRadius: "999px",
          boxShadow: hovered
            ? "0 8px 26px rgba(0,0,0,0.18)"
            : "0 6px 18px rgba(0,0,0,0.14)",
        }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 2.2] }}
        className={cn(
          "pointer-events-auto relative inline-flex items-center gap-2 overflow-hidden rounded-full",
          "origin-left transition-[max-width] duration-420 ease-[cubic-bezier(0.23,1,0.32,1)]",
          hovered ? "z-10" : "",
          className,
        )}
        style={{ maxWidth: hovered ? expandedMaxWidth : "100%" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full [isolation:isolate]"
          style={{
            backdropFilter: "blur(3px) saturate(155%)",
            WebkitBackdropFilter: "blur(3px) saturate(155%)",
            filter: "url(#lg-glass-pill)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "rgba(255,255,255,0.14)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] rounded-full"
          style={{
            background:
              "radial-gradient(120% 70% at 18% 0%, rgba(255,255,255,0.26), rgba(255,255,255,0.05) 38%, rgba(255,255,255,0) 72%), radial-gradient(110% 90% at 82% 100%, rgba(255,255,255,0.12), rgba(255,255,255,0) 62%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] rounded-full bg-[radial-gradient(78%_24%_at_50%_0%,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0)_76%)]" />
        <div className="relative z-[3] flex min-w-0 items-center gap-2 overflow-hidden">
          {icon ?? (
            <span className="grid h-3.5 w-3.5 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border border-white/30">
              <span className="bg-[#f7f2e7]" />
              <span className="bg-[#1f57d6]" />
              <span className="bg-[#e53b2f]" />
              <span className="bg-[#f2c94c]" />
            </span>
          )}
          <span
            className="min-w-0 truncate whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{
              color: "rgba(104, 120, 148, 0.96)",
            }}
          >
            {label}
          </span>
        </div>
      </motion.div>
    </>
  );
}
