"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";

import { LiquidGlassSurface, type LiquidGlassTone } from "./materials";
import { liquidGlassHoverTransition, liquidGlassPressTransition } from "./motion";

export interface GlassInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  tone?: LiquidGlassTone;
}

export function GlassInput({
  id,
  label,
  helperText,
  prefix,
  suffix,
  tone = "neutral",
  className,
  onFocus,
  onBlur,
  disabled,
  ...inputProps
}: GlassInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);

  return (
    <label htmlFor={inputId} className="block space-y-2">
      {label ? (
        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
          {label}
        </span>
      ) : null}

      <motion.div
        animate={{
          scale: focused ? 1.004 : 1,
          y: 0,
          borderRadius: focused ? "1.75rem" : "1.5rem",
        }}
        transition={focused ? liquidGlassHoverTransition : liquidGlassPressTransition}
      >
        <LiquidGlassSurface
          variant="control"
          tone={tone}
          className={[
            "rounded-[24px] px-4 py-3",
            focused ? "border-white/45 shadow-[0_16px_40px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.36)_inset]" : "",
            disabled ? "opacity-55" : "",
            className ?? "",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            {prefix ? <div className="shrink-0 text-neutral-500">{prefix}</div> : null}
            <input
              id={inputId}
              disabled={disabled}
              className="min-w-0 flex-1 bg-transparent text-base text-neutral-950 outline-none placeholder:text-neutral-500/85"
              onFocus={(event) => {
                setFocused(true);
                onFocus?.(event);
              }}
              onBlur={(event) => {
                setFocused(false);
                onBlur?.(event);
              }}
              {...inputProps}
            />
            {suffix ? <div className="shrink-0 text-neutral-500">{suffix}</div> : null}
          </div>
        </LiquidGlassSurface>
      </motion.div>

      {helperText ? <p className="text-sm leading-6 text-neutral-500">{helperText}</p> : null}
    </label>
  );
}
