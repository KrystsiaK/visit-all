"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { ReactNode } from "react";

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
}

interface AdminAreaChartProps {
  title: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  series: SeriesConfig[];
  xKey?: string;
  icon?: ReactNode;
  height?: number;
  className?: string;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl shadow-xl px-4 py-3 text-xs">
      <p className="font-black text-neutral-500 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="font-bold" style={{ color: entry.color }}>
          {entry.name}:{" "}
          <span className="text-neutral-900 tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AdminAreaChart({
  title,
  subtitle,
  data,
  series,
  xKey = "date",
  icon,
  height = 210,
  className = "",
}: AdminAreaChartProps) {
  return (
    <LiquidGlassSurface
      variant="frosted-glass"
      tone="neutral"
      effect="default"
      className={`p-5 rounded-[24px] border border-black/5 bg-white/60 shadow-xs flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-start gap-2">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div>
          <h3 className="text-sm font-black uppercase text-neutral-800 tracking-wide">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`ag-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          {series.length > 1 && (
            <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "700", paddingTop: "4px" }} />
          )}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#ag-${s.key})`}
              dot={{ fill: "#fff", stroke: s.color, strokeWidth: 2, r: 3.5 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </LiquidGlassSurface>
  );
}