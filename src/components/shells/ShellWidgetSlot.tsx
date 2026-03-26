"use client";

import { motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { cn } from "@/components/ui/utils";

interface ShellWidgetSlotProps {
  children: ReactNode;
  isDragging: boolean;
  isDropTarget: boolean;
  dropEdge: "before" | "after" | null;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

export const ShellWidgetSlot = ({
  children,
  isDragging,
  isDropTarget,
  dropEdge,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: ShellWidgetSlotProps) => (
  <div
    className={cn(
      "group relative pointer-events-auto",
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

      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="absolute inset-x-0 top-0 z-[2] flex h-5 items-start justify-center cursor-grab active:cursor-grabbing"
        aria-label="Reorder widget"
        title="Drag to reorder widget"
      >
        <div className="mt-0 flex h-3.5 min-w-14 items-start justify-center rounded-full text-neutral-300 transition-colors duration-200 group-hover:text-neutral-500">
          <GripHorizontal className="h-3.5 w-3.5" />
        </div>
      </div>

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
