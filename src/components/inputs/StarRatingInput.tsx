"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useMemo } from "react";

import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/components/ui/utils";

interface StarRatingInputProps {
  value: number | null;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onChange?: (value: number) => void;
}

export function StarRatingInput({
  value,
  max = 5,
  disabled = false,
  readOnly = false,
  className,
  onChange,
}: StarRatingInputProps) {
  const stars = useMemo(() => Array.from({ length: max }, (_, index) => index + 1), [max]);
  const shouldReduceMotion = useReducedMotion();
  const fillClassByRating: Record<
    number,
    {
      shell: string;
      icon: string;
      sheen: string;
    }
  > = {
    1: {
      shell: "border-[#cf281b] bg-[#ff3b30]",
      icon: "text-white",
      sheen: "bg-white/24",
    },
    2: {
      shell: "border-[#d6b100] bg-[#ffe24a]",
      icon: "text-[#111111]",
      sheen: "bg-white/30",
    },
    3: {
      shell: "border-[#1f56d8] bg-[#2563eb]",
      icon: "text-white",
      sheen: "bg-white/22",
    },
    4: {
      shell: "border-[#cf281b] bg-[#ff3b30]",
      icon: "text-white",
      sheen: "bg-white/24",
    },
    5: {
      shell: "border-[#d6b100] bg-[#ffe24a]",
      icon: "text-[#111111]",
      sheen: "bg-white/30",
    },
  };
  const activePalette = value ? fillClassByRating[value] : null;

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `Rating: ${value ?? 0} out of ${max}` : `Choose a rating from 1 to ${max}`}
    >
      {stars.map((starValue) => {
        const filled = (value ?? 0) >= starValue;
        const transitionDelay = shouldReduceMotion || !filled ? 0 : (starValue - 1) * 0.03;
        const settledBoxShadow = filled
          ? "0px 10px 24px rgba(0,0,0,0.12), 0px 3px 10px rgba(0,0,0,0.06)"
          : "0px 2px 8px rgba(0,0,0,0.05)";

        if (readOnly) {
          return (
            <motion.span
              key={starValue}
              layout
              animate={{
                scale: filled ? 1.02 : 1,
                y: filled ? -1 : 0,
                boxShadow: settledBoxShadow,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 30,
                mass: 0.8,
                delay: transitionDelay,
              }}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border shadow-[0px_2px_8px_rgba(0,0,0,0.05)]",
                filled
                  ? activePalette?.shell
                  : "border-black/10 bg-white/90 text-neutral-300"
              )}
              aria-hidden="true"
            >
              {filled && activePalette ? (
                <>
                  <motion.span
                    aria-hidden="true"
                    className={cn("absolute inset-x-[11px] top-[7px] h-[9px] rounded-full blur-[1px]", activePalette.sheen)}
                    animate={{ opacity: 0.95, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 30,
                      delay: transitionDelay,
                    }}
                  />
                </>
              ) : null}
              <motion.span
                animate={{
                  scale: filled ? 1 : 0.94,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 30,
                  mass: 0.8,
                  delay: transitionDelay,
                }}
                className="relative z-[1]"
              >
                <Star className={cn("h-5 w-5", filled ? cn("fill-current", activePalette?.icon) : "")} />
              </motion.span>
            </motion.span>
          );
        }

        return (
          <Tooltip key={starValue} label={`${starValue} star${starValue === 1 ? "" : "s"}`}>
            <motion.button
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
              onClick={() => onChange?.(starValue)}
              disabled={disabled}
              whileTap={{ scale: 0.94 }}
              animate={{
                scale: filled ? 1.02 : 1,
                y: filled ? -1 : 0,
                boxShadow: settledBoxShadow,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 30,
                mass: 0.8,
                delay: transitionDelay,
              }}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border transition-[border-color,background-color,color,box-shadow] shadow-[0px_2px_8px_rgba(0,0,0,0.05)]",
                filled
                  ? activePalette?.shell
                  : "border-black/10 bg-white/90 text-neutral-400 hover:border-black/20 hover:text-neutral-700",
                "disabled:cursor-not-allowed disabled:opacity-45"
              )}
              style={{
                boxShadow: filled
                  ? "0px 10px 24px rgba(0,0,0,0.10), 0px 3px 10px rgba(0,0,0,0.05)"
                  : undefined,
              }}
            >
              {filled && activePalette ? (
                <>
                  <motion.span
                    aria-hidden="true"
                    className={cn("absolute inset-x-[11px] top-[7px] h-[9px] rounded-full blur-[1px]", activePalette.sheen)}
                    initial={false}
                    animate={{
                      opacity: filled ? 0.95 : 0,
                      y: filled ? 0 : -2,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 28,
                      delay: transitionDelay,
                    }}
                  />
                </>
              ) : null}
              <motion.span
                animate={{
                  scale: filled ? 1 : 0.94,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 30,
                  mass: 0.8,
                  delay: transitionDelay,
                }}
                className="relative z-[1]"
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    filled ? cn("fill-current", activePalette?.icon) : ""
                  )}
                />
              </motion.span>
            </motion.button>
          </Tooltip>
        );
      })}
    </div>
  );
}
