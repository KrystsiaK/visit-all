"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

import { cn } from "../lib/cn";

/* ── Constants ───────────────────────────────────── */

/** Max expanded width before horizontal scroll kicks in. */
const PILL_EXPAND_MAX = 480;

/** Framer spring for the hover lift / scale / shadow. */
const pillSpring = { type: "spring" as const, stiffness: 340, damping: 26, mass: 0.75 };

/** Cubic ease-in-out for the auto-scroll animation. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/* ── Hover-expand + auto-scroll hook ─────────────── */

function useHoverExpand() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => {
    setHovered(false);
    setOverflows(false);
    setFadeLeft(false);
    setFadeRight(false);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, []);

  useEffect(() => {
    if (!hovered) return;

    const el = scrollRef.current;
    if (!el) return;

    let cancelled = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) return resolve();
        timers.push(setTimeout(resolve, ms));
      });

    const updateFades = () => {
      if (!el || cancelled) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      setFadeLeft(scrollLeft > 2);
      setFadeRight(max > 2 && scrollLeft < max - 2);
    };

    const slide = (from: number, to: number, ms: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) return resolve();
        const t0 = performance.now();
        const step = (now: number) => {
          if (cancelled) return resolve();
          const p = Math.min((now - t0) / ms, 1);
          el.scrollLeft = from + (to - from) * easeInOutCubic(p);
          updateFades();
          if (p < 1) raf = requestAnimationFrame(step);
          else resolve();
        };
        raf = requestAnimationFrame(step);
      });

    /* Wait for the CSS max-width expansion to settle, then run auto-scroll */
    const init = setTimeout(async () => {
      if (cancelled || !el) return;
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow <= 0) return;

      setOverflows(true);
      setFadeRight(true);
      const dur = Math.max(2200, overflow * 12);

      while (!cancelled) {
        await delay(900);
        if (cancelled) break;
        const max = el.scrollWidth - el.clientWidth;
        await slide(0, max, dur);
        await delay(700);
        if (cancelled) break;
        await slide(max, 0, dur);
      }
    }, 420);

    return () => {
      cancelled = true;
      clearTimeout(init);
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      if (el) el.scrollLeft = 0;
    };
  }, [hovered]);

  return { scrollRef, hovered, overflows, fadeLeft, fadeRight, onEnter, onLeave };
}

/* ── Scrollbar hide (supplements .no-scrollbar) ─── */

const hideScrollbar: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

/* ── Edge-fade overlays ──────────────────────────── *
 *  Two absolutely-positioned gradient divs whose     *
 *  opacity transitions smoothly via CSS, replacing   *
 *  mask-image (which is NOT animatable and flashes). *
 * ─────────────────────────────────────────────────── */

const FADE_GRADIENT_LEFT =
  "linear-gradient(to right, rgba(255,255,255,0.95) 20%, transparent 100%)";
const FADE_GRADIENT_RIGHT =
  "linear-gradient(to left, rgba(255,255,255,0.95) 20%, transparent 100%)";

interface ScrollFadesProps {
  left: boolean;
  right: boolean;
}

const ScrollFades = ({ left, right }: ScrollFadesProps) => (
  <>
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 z-2 w-6 rounded-l-full",
        "transition-opacity duration-300 ease-out",
        left ? "opacity-100" : "opacity-0",
      )}
      style={{ background: FADE_GRADIENT_LEFT }}
    />
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 z-2 w-6 rounded-r-full",
        "transition-opacity duration-300 ease-out",
        right ? "opacity-100" : "opacity-0",
      )}
      style={{ background: FADE_GRADIENT_RIGHT }}
    />
  </>
);

/* ── Shimmer sweep (one-shot on hover) ───────────── */

const Shimmer = () => (
  <motion.div
    aria-hidden
    className="pointer-events-none absolute inset-0 z-3 overflow-hidden rounded-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <motion.div
      className="absolute inset-y-0 -left-full w-[200%]"
      initial={{ x: "-30%" }}
      animate={{ x: "30%" }}
      transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background:
          "linear-gradient(90deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
      }}
    />
  </motion.div>
);

/* ── Shadow tokens ───────────────────────────────── */

const shadowResting = "0 1px 3px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.06)";
const shadowHovered =
  "0 2px 6px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.11), 0 0 0 1px rgba(255,255,255,0.45) inset";

/* ── TitlePill ───────────────────────────────────── */

interface TitlePillProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Max width when expanded on hover. Defaults to `PILL_EXPAND_MAX` (480 px).
   *  Pass `"100%"` when the pill must stay inside a bounded container. */
  expandedMaxWidth?: number | string;
}

export const TitlePill = ({
  eyebrow,
  title,
  subtitle,
  className,
  expandedMaxWidth = PILL_EXPAND_MAX,
}: TitlePillProps) => {
  const { scrollRef, hovered, overflows, fadeLeft, fadeRight, onEnter, onLeave } =
    useHoverExpand();

  if (!eyebrow && !title && !subtitle) return null;

  return (
    <motion.div
      onHoverStart={onEnter}
      onHoverEnd={onLeave}
      animate={{
        boxShadow: hovered ? shadowHovered : shadowResting,
      }}
      transition={pillSpring}
      className={cn(
        "pointer-events-auto relative inline-flex items-center rounded-full border backdrop-blur-xl",
        "px-3 py-1.5",
        "transition-[max-width,background-color,border-color] duration-420 ease-[cubic-bezier(0.23,1,0.32,1)]",
        hovered
          ? "z-10 border-white/25 bg-white/94"
          : "border-black/8 bg-white/80",
        className,
      )}
      style={{ maxWidth: hovered ? expandedMaxWidth : "100%" }}
    >
      {/* Shimmer light sweep */}
      <AnimatePresence>{hovered ? <Shimmer key="shimmer" /> : null}</AnimatePresence>

      {/* Edge fades for scroll indication */}
      <ScrollFades left={fadeLeft} right={fadeRight} />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn(
          "relative z-1 flex items-center gap-2",
          hovered ? "overflow-x-auto no-scrollbar" : "overflow-hidden",
        )}
        style={hovered ? hideScrollbar : undefined}
      >
        {eyebrow ? (
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500",
              hovered ? "whitespace-nowrap" : "truncate",
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        {title ? (
          <span
            className={cn(
              "text-xs font-semibold text-neutral-900",
              hovered ? "whitespace-nowrap" : "truncate",
            )}
          >
            {title}
          </span>
        ) : null}
        {subtitle ? (
          <span
            className={cn(
              "text-[11px] text-neutral-500",
              hovered ? "whitespace-nowrap" : "truncate",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
};

/* ── Compact variant ─────────────────────────────── */

interface CompactTitlePillProps {
  label: string;
  icon?: ReactNode;
  className?: string;
  /** Max width when expanded on hover. Defaults to `PILL_EXPAND_MAX` (480 px).
   *  Pass `"100%"` when the pill must stay inside a bounded container. */
  expandedMaxWidth?: number | string;
}

export const CompactTitlePill = ({
  label,
  icon,
  className,
  expandedMaxWidth = PILL_EXPAND_MAX,
}: CompactTitlePillProps) => {
  const { scrollRef, hovered, overflows, fadeLeft, fadeRight, onEnter, onLeave } =
    useHoverExpand();

  return (
    <motion.div
      onHoverStart={onEnter}
      onHoverEnd={onLeave}
      animate={{
        boxShadow: hovered ? shadowHovered : shadowResting,
      }}
      transition={pillSpring}
      className={cn(
        "pointer-events-auto relative inline-flex items-center gap-2 rounded-full border backdrop-blur-xl",
        "px-2.5 py-1",
        "transition-[max-width,background-color,border-color] duration-420 ease-[cubic-bezier(0.23,1,0.32,1)]",
        hovered
          ? "z-10 border-white/25 bg-white/94"
          : "border-black/8 bg-white/82",
        className,
      )}
      style={{ maxWidth: hovered ? expandedMaxWidth : "100%" }}
    >
      {/* Shimmer */}
      <AnimatePresence>{hovered ? <Shimmer key="shimmer" /> : null}</AnimatePresence>

      {/* Edge fades */}
      <ScrollFades left={fadeLeft} right={fadeRight} />

      {/* Icon */}
      <span className="relative z-1 flex shrink-0 items-center">
        {icon ?? (
          <span className="grid h-3.5 w-3.5 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border border-black/10 bg-white/70">
            <span className="bg-[#ff0000]" />
            <span className="bg-[#ffff00]" />
            <span className="bg-[#0000ff]" />
            <span className="bg-[#111111]" />
          </span>
        )}
      </span>

      {/* Scrollable label */}
      <div
        ref={scrollRef}
        className={cn(
          "relative z-1 flex min-w-0 flex-1 items-center",
          hovered ? "overflow-x-auto no-scrollbar" : "overflow-hidden",
        )}
        style={hovered ? hideScrollbar : undefined}
      >
        <span className="whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-[0.2em] text-neutral-500">
          {label}
        </span>
      </div>
    </motion.div>
  );
};

