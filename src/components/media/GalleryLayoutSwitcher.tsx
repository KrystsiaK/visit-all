"use client";

import { Grid2x2, LayoutGrid, Rows3 } from "lucide-react";

import { cn } from "@/components/ui/utils";

export type GalleryLayoutMode = "mosaic" | "grid" | "strip";

interface GalleryLayoutSwitcherProps {
  value: GalleryLayoutMode;
  onChange: (value: GalleryLayoutMode) => void;
  disabled?: boolean;
}

const LAYOUT_OPTIONS: Array<{
  value: GalleryLayoutMode;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { value: "mosaic", label: "Mosaic", icon: LayoutGrid },
  { value: "grid", label: "Grid", icon: Grid2x2 },
  { value: "strip", label: "Strip", icon: Rows3 },
];

export function GalleryLayoutSwitcher({
  value,
  onChange,
  disabled = false,
}: GalleryLayoutSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-black/8 bg-white/75 p-1 shadow-[0px_8px_18px_rgba(0,0,0,0.04)]">
      {LAYOUT_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex h-10 items-center gap-2 rounded-[14px] px-3 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-55",
              selected
                ? "bg-[#111111] text-white shadow-[0px_8px_16px_rgba(17,17,17,0.18)]"
                : "text-neutral-500 hover:bg-white hover:text-neutral-900"
            )}
            aria-pressed={selected}
            aria-label={`Use ${option.label.toLowerCase()} gallery layout`}
          >
            <Icon className="h-4 w-4" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
