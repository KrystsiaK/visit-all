"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { ReactNode } from "react";

interface AdminBarChartProps {
  title: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  icon?: ReactNode;
  height?: number;
  horizontal?: boolean;
  className?: string;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl shadow-xl px-4 py-3 text-xs">
      <p className="font-black text-neutral-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-black text-neutral-900 tabular-nums">{payload[0]?.value}</p>
    </div>
  );
}

export function AdminBarChart({
  title,
  subtitle,
  data,
  dataKey,
  nameKey = "name",
  color = "#0000ff",
  icon,
  height = 210,
  horizontal = false,
  className = "",
}: AdminBarChartProps) {
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
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 4, left: horizontal ? 4 : -22, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.05)"
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey={nameKey}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={nameKey}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
            </>
          )}
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar
            dataKey={dataKey}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={36}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={color} opacity={0.7 + (index % 4) * 0.075} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </LiquidGlassSurface>
  );
}