"use client";

import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  trend?: number;
  trendLabel?: string;
  sublabel?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  iconColor = "#0000ff",
  trend,
  trendLabel,
  sublabel,
}: KpiCardProps) {
  const hasTrend = trend !== undefined;
  const trendUp = hasTrend && trend > 0;
  const trendDown = hasTrend && trend < 0;

  return (
    <LiquidGlassSurface
      variant="frosted-glass"
      tone="neutral"
      effect="default"
      className="p-5 rounded-[24px] border border-black/5 bg-white/70 shadow-xs flex flex-col gap-3 hover:bg-white/85 transition-colors cursor-default"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-xs"
          style={{ backgroundColor: iconColor + "18" }}
        >
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
        {hasTrend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-xl ${
              trendUp
                ? "bg-emerald-50 text-emerald-600"
                : trendDown
                  ? "bg-rose-50 text-[#b7102a]"
                  : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {trendUp && <TrendingUp className="w-3 h-3" />}
            {trendDown && <TrendingDown className="w-3 h-3" />}
            {!trendUp && !trendDown && <Minus className="w-3 h-3" />}
            {trendUp && "+"}
            {trend}%
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight tabular-nums">
          {value}
        </div>
        <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mt-0.5">
          {label}
        </div>
        {sublabel && (
          <div className="text-[11px] text-neutral-400 font-medium mt-1">{sublabel}</div>
        )}
        {trendLabel && (
          <div className="text-[11px] text-neutral-400 mt-1">{trendLabel}</div>
        )}
      </div>
    </LiquidGlassSurface>
  );
}