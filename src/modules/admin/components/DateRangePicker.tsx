"use client";

import { useState } from "react";
import { usePortEmitter } from "@synarava/wiring-engine";
import { CalendarDays, RefreshCw } from "lucide-react";
import type { DateRange } from "../types";

const PRESETS: { label: string; days: number }[] = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function rangeFromDays(days: number): DateRange {
  const to = new Date();
  const from = new Date(Date.now() - (days - 1) * 86400000);
  return { from: toDateStr(from), to: toDateStr(to) };
}

interface DateRangePickerProps {
  onRefresh?: () => void;
  sectionTitle?: string;
}

export function DateRangePicker({ onRefresh, sectionTitle }: DateRangePickerProps) {
  const [activeDays, setActiveDays] = useState<number>(7);
  const [range, setRange] = useState<DateRange>(() => rangeFromDays(7));

  // Declarative emitter — fires whenever `range` changes
  usePortEmitter("date-range-picker", "range_out", range);

  const select = (days: number) => {
    setActiveDays(days);
    setRange(rangeFromDays(days));
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {sectionTitle && (
        <h2 className="text-base font-black uppercase tracking-tight text-neutral-900">
          {sectionTitle}
        </h2>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <CalendarDays className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <div className="flex items-center gap-1 bg-white/80 border border-black/[0.08] rounded-2xl p-1 shadow-xs">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => select(p.days)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                activeDays === p.days
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-black/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-black/10 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
