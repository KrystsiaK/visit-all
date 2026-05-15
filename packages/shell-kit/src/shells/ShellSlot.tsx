"use client";

import { motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { cn } from "../lib/cn";

interface ShellSlotProps {
  children: ReactNode;
  compact?: boolean;
  hideHandle?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  dropEdge?: "before" | "after" | null;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
}

export const ShellSlot = ({
  children,
  compact = false,
  hideHandle = false,
  isDragging = false,
  isDropTarget = false,
  dropEdge = null,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: ShellSlotProps) => {
  const reorderEnabled = Boolean(onDragStart && onDragEnd && onDragOver && onDrop);

  return (
    <div
      className={cn(
        "group relative w-full pointer-events-auto",
        compact ? "pt-0 pb-4" : "pt-3",
        isDragging && "z-10"
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-full bg-[#0f62fe] opacity-0 transition-opacity",
        isDropTarget && dropEdge === "before" && "opacity-100"
      )}
    />

    <div className="relative">
      {isDragging ? (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[28px]"
            animate={{
              opacity: [0.5, 0.9, 0.5],
              boxShadow: [
                "inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 0 rgba(47,107,255,0)",
                "inset 0 0 0 1px rgba(255,255,255,0.32), 0 0 34px rgba(255,213,74,0.14), 0 0 14px rgba(47,107,255,0.12)",
                "inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 0 rgba(47,107,255,0)",
              ],
            }}
            transition={{ duration: 1.6, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(47,107,255,0.16), rgba(255,213,74,0.22), rgba(230,57,70,0.12), rgba(255,255,255,0.04))",
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-y-[-6%] -left-[52%] w-[72%] rounded-full"
            animate={{ x: ["0%", "225%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,245,196,0.22), rgba(255,255,255,0))",
              filter: "blur(14px)",
              transform: "skewX(-18deg)",
            }}
          />
        </>
      ) : null}

      {reorderEnabled && !hideHandle ? (
        <div className="pointer-events-none absolute inset-x-0 top-[-6px] z-[5] flex h-4 items-start justify-center">
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="pointer-events-auto flex h-3.5 min-w-10 items-start justify-center rounded-full bg-white/82 px-2 text-neutral-300 shadow-[0px_4px_10px_rgba(0,0,0,0.08)] ring-1 ring-black/6 transition-[color,background-color,box-shadow] duration-200 group-hover:bg-white/92 group-hover:text-neutral-500 cursor-grab active:cursor-grabbing"
            aria-label="Reorder widget"
            title="Drag to reorder widget"
          >
            <GripHorizontal className="h-3.5 w-3.5" />
          </div>
        </div>
      ) : null}

      <div className={cn("transition-[transform,opacity] duration-200", isDragging && "scale-[1.01] opacity-90")}>
        {children}
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#0f62fe] opacity-0 transition-opacity",
        isDropTarget && dropEdge === "after" && "opacity-100"
      )}
    />
    </div>
  );
};
