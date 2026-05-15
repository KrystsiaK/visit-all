"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { LiquidGlassSurface } from "@synarava/liquid-glass";

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

const paneGlassOverlay =
  "radial-gradient(90% 75% at 50% 0%, rgba(255,255,255,0.34), rgba(255,255,255,0) 58%), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.08) 100%)";

interface RippleState {
  id: number;
  x: number;
  y: number;
  size: number;
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
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const rippleIds = useRef<number[]>([]);

  useEffect(
    () => () => {
      rippleIds.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  const removeRipple = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.3;
      const ripple: RippleState = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        size,
      };

      setRipples((current) => [...current, ripple]);

      const timeoutId = window.setTimeout(() => {
        removeRipple(ripple.id);
        rippleIds.current = rippleIds.current.filter((activeId) => activeId !== timeoutId);
      }, 620);

      rippleIds.current.push(timeoutId);
    },
    [disabled, removeRipple]
  );

  return (
    <LiquidGlassSurface
      variant="widget"
      tone={tone}
      effect="amplified"
      transparency={0.12}
      shineIntensity={1.02}
      refractive
      className="group/cta pointer-events-auto block w-full max-w-full overflow-hidden rounded-xl shadow-[0px_8px_20px_rgba(0,0,0,0.1)] transition-[box-shadow,filter] duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:shadow-[0px_10px_22px_rgba(0,0,0,0.12)]"
      materialStyle={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,246,241,0.84) 100%)",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        onPointerDown={handlePointerDown}
        disabled={disabled}
        className="group relative flex h-[76px] w-full max-w-full overflow-hidden rounded-xl text-left transition-[filter] duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/cta:[filter:saturate(1.03)_brightness(1.01)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="pointer-events-none absolute inset-0 z-[0] opacity-0 transition-opacity duration-250 group-hover/cta:opacity-100">
          <div className="absolute -left-[20%] top-[-14%] h-[56%] w-[58%] rounded-full bg-white/16 blur-2xl" />
          <div className="absolute right-[-18%] top-[22%] h-[52%] w-[44%] rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
          <AnimatePresence initial={false}>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute rounded-full bg-white/40 shadow-[0_0_28px_rgba(255,255,255,0.22)]"
                initial={{
                  opacity: 0.38,
                  scale: 0,
                  x: ripple.x - ripple.size / 2,
                  y: ripple.y - ripple.size / 2,
                }}
                animate={{
                  opacity: 0,
                  scale: 2.05,
                  x: ripple.x - ripple.size / 2,
                  y: ripple.y - ripple.size / 2,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.58, ease: [0.2, 0, 0, 1] }}
                style={{ width: ripple.size, height: ripple.size }}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className={`relative z-[2] shrink-0 overflow-hidden rounded-l-xl ${colorPaneWidthClassName}`}>
          <div className="absolute inset-0">{colorBars}</div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/45" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/28" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_1px_1px_0_rgba(255,255,255,0.22),inset_-1px_-1px_0_rgba(0,0,0,0.08)] transition-[box-shadow] duration-250 group-hover/cta:shadow-[inset_1px_1px_0_rgba(255,255,255,0.28),inset_-1px_-1px_0_rgba(0,0,0,0.1)]" />
        </div>

        <div className={`relative z-[2] flex shrink-0 items-center justify-center border-x border-black/10 ${iconPaneWidthClassName} ${iconPaneClassName}`}>
          <div className="absolute inset-0" style={{ background: paneGlassOverlay }} />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_1px_1px_0_rgba(255,255,255,0.26),inset_-1px_-1px_0_rgba(0,0,0,0.08)] transition-[box-shadow] duration-250 group-hover/cta:shadow-[inset_1px_1px_0_rgba(255,255,255,0.32),inset_-1px_-1px_0_rgba(0,0,0,0.1)]" />
          <div className="relative z-[1]">{icon}</div>
        </div>

        <div className={`relative z-[2] flex min-w-0 flex-1 items-center overflow-hidden ${titlePaneClassName}`}>
          <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_18%_0%,rgba(255,255,255,0.4),rgba(255,255,255,0)_46%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-black/8" />
          <div className="relative z-[1] min-w-0 w-full max-w-full">{title}</div>
        </div>
      </button>
    </LiquidGlassSurface>
  );
};

export const shellActionPaneGlassOverlay = paneGlassOverlay;
