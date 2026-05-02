"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GlassFilterDefs } from "@synarava/liquid-glass";

import { cn } from "../lib/cn";

const PILL_EXPAND_MAX = 480;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function useHoverExpand() {
  const [hovered, setHovered] = useState(false);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return {
    hovered,
    onEnter,
    onLeave,
  };
}

interface TitlePillTextRowProps {
  hovered: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

function TitlePillTextRow({
  hovered,
  eyebrow,
  title,
  subtitle,
}: TitlePillTextRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const setTrackOffset = (value: number) => {
      track.style.transform = `translateX(${value}px)`;
    };

    if (!hovered || !viewport) {
      setTrackOffset(0);
      return;
    }

    let cancelled = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const slide = (from: number, to: number, ms: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const step = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }

          const progress = Math.min((now - start) / ms, 1);
          setTrackOffset(from + (to - from) * easeInOutCubic(progress));

          if (progress < 1) {
            raf = requestAnimationFrame(step);
          } else {
            resolve();
          }
        };

        raf = requestAnimationFrame(step);
      });

    void (async () => {
      await wait(460);
      if (cancelled) {
        return;
      }

      while (!cancelled) {
        const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
        if (overflow <= 2) {
          setTrackOffset(0);
          return;
        }

        const duration = Math.max(2200, overflow * 14);
        await wait(900);
        if (cancelled) break;
        await slide(0, -overflow, duration);
        await wait(700);
        if (cancelled) break;
        await slide(-overflow, 0, duration);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      setTrackOffset(0);
    };
  }, [hovered, eyebrow, title, subtitle]);

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative z-1 flex min-w-0 flex-1 items-center gap-2",
        "overflow-hidden",
      )}
    >
      <div
        ref={trackRef}
        className="flex min-w-max items-center gap-2"
        style={{
          willChange: hovered ? "transform" : undefined,
        }}
      >
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
      {title ? (
        <span
          className="shrink-0 whitespace-nowrap text-xs font-semibold"
          style={{
            color: "rgba(132, 150, 182, 0.96)",
          }}
        >
          {title}
        </span>
      ) : null}
      {subtitle ? (
        <span
          className="shrink-0 whitespace-nowrap text-[11px]"
          style={{
            color: "rgba(98, 114, 142, 0.92)",
          }}
        >
          {subtitle}
        </span>
        ) : null}
      </div>
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
          borderRadius: hovered ? "999px" : "999px",
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
            hovered={hovered}
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
          padding: hovered ? "0.375rem 0.8rem" : "0.25rem 0.625rem",
          borderRadius: hovered ? "999px" : "999px",
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
        <span className="relative z-[3] flex shrink-0 items-center">
          {icon ?? (
            <span className="grid h-3.5 w-3.5 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border border-white/30">
              <span className="bg-[#ff0000]" />
              <span className="bg-[#ffff00]" />
              <span className="bg-[#0000ff]" />
              <span className="bg-[#111111]" />
            </span>
          )}
        </span>

        <div
          className={cn(
            "relative z-[3] flex min-w-0 flex-1 items-center",
            "overflow-hidden",
          )}
        >
          <span
            className="whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-[0.2em]"
            style={{
              color: "rgba(116, 132, 160, 0.94)",
            }}
          >
            {label}
          </span>
        </div>
      </motion.div>
    </>
  );
}
