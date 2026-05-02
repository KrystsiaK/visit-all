"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";

import type { GlassAnimation, GlassAnimationState, GlassAnimationTrigger } from "../animations/types";
import { resolveGlassAnimation } from "../animations/presets";
import {
  buildGlassStyle,
  cn,
  LiquidGlassVariantOverlays,
  type LiquidGlassEffect,
  type LiquidGlassSurfaceVariant,
  type LiquidGlassTone,
} from "./shared";

export interface LiquidGlassSurfaceProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  materialStyle?: CSSProperties;
  variant?: LiquidGlassSurfaceVariant;
  tone?: LiquidGlassTone;
  effect?: LiquidGlassEffect;
  transparency?: number;
  shineIntensity?: number;
  refractive?: boolean;
  animation?: GlassAnimation;
  animationTrigger?: GlassAnimationTrigger;
}

function mergeAnimationState(
  base: GlassAnimationState | undefined,
  interactive: GlassAnimationState | undefined,
): GlassAnimationState | undefined {
  if (!base && !interactive) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(interactive ?? {}),
    transition: interactive?.transition ?? base?.transition,
  };
}

export function LiquidGlassSurface({
  children,
  className,
  style,
  materialStyle,
  variant = "widget",
  tone = "neutral",
  effect = "default",
  transparency = 0,
  shineIntensity = 1,
  refractive = false,
  animation,
  animationTrigger = "hover",
  ...divProps
}: LiquidGlassSurfaceProps) {
  const [clicked, setClicked] = useState(false);
  const glassStyle = useMemo(() => {
    const baseStyle = buildGlassStyle(variant, tone, effect, transparency, shineIntensity);

    if (refractive) {
      baseStyle.backdropFilter = (baseStyle.backdropFilter as string).replace(
        "url(#lg-refract)",
        "url(#lg-refract-strong)",
      );
      baseStyle.WebkitBackdropFilter = (baseStyle.WebkitBackdropFilter as string).replace(
        "url(#lg-refract)",
        "url(#lg-refract-strong)",
      );
    }

    return baseStyle;
  }, [variant, tone, effect, transparency, shineIntensity, refractive]);

  const mergedStyle = useMemo(() => {
    if (!style) {
      return materialStyle ? { ...glassStyle, ...materialStyle } : glassStyle;
    }

    const {
      backdropFilter,
      WebkitBackdropFilter,
      backgroundColor,
      boxShadow,
      transition,
      ...userStyle
    } = style;

    void backdropFilter;
    void WebkitBackdropFilter;
    void backgroundColor;
    void boxShadow;
    void transition;

    return {
      ...userStyle,
      ...glassStyle,
      ...materialStyle,
    };
  }, [glassStyle, materialStyle, style]);

  const animationDef = useMemo(() => resolveGlassAnimation(animation), [animation]);
  const interactiveState = animationDef?.whileHover ?? animationDef?.whileTap;
  const interactiveContentState = animationDef?.contentWhileHover ?? animationDef?.contentWhileTap;
  const animateState =
    animationTrigger === "click"
      ? mergeAnimationState(animationDef?.animate, clicked ? interactiveState : undefined)
      : animationDef?.animate;
  const animateContentState =
    animationTrigger === "click"
      ? mergeAnimationState(animationDef?.contentAnimate, clicked ? interactiveContentState : undefined)
      : animationDef?.contentAnimate;

  const motionProps = animationDef
    ? {
        initial: animationDef.initial as never,
        animate: animateState as never,
        exit: animationDef.exit as never,
        whileHover: (animationTrigger === "hover" ? animationDef.whileHover : undefined) as never,
        whileTap: (animationTrigger === "tap" ? animationDef.whileTap : undefined) as never,
        whileDrag: animationDef.whileDrag as never,
        transition: animationDef.transition,
        variants: animationDef.variants,
      }
    : {};

  const contentMotionProps = animationDef
    ? {
        initial: animationDef.contentInitial as never,
        animate: animateContentState as never,
        exit: animationDef.contentExit as never,
        whileHover:
          (animationTrigger === "hover" ? animationDef.contentWhileHover : undefined) as never,
        whileTap:
          (animationTrigger === "tap" ? animationDef.contentWhileTap : undefined) as never,
        transition: animationDef.transition,
      }
    : {};

  const handleClick: HTMLMotionProps<"div">["onClick"] = (event) => {
    if (animationTrigger === "click" && animationDef) {
      setClicked((value) => !value);
    }

    divProps.onClick?.(event);
  };

  return (
    <motion.div
      className={cn("relative isolate overflow-hidden", className)}
      style={mergedStyle}
      {...motionProps}
      onClick={handleClick}
      {...divProps}
    >
      <LiquidGlassVariantOverlays
        variant={variant}
        effect={effect}
        transparency={transparency}
      />
      <motion.div className="relative z-[3] h-full w-full" {...contentMotionProps}>
        {children}
      </motion.div>
    </motion.div>
  );
}
