"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { ReactNode } from "react";

const PALETTE = ["#0000ff", "#b7102a", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4"];

interface AdminDonutChartProps {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number }>;
  icon?: ReactNode;
  height?: number;
  className?: string;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const total: number = payload[0]?.payload?.total ?? 1;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl shadow-xl px-4 py-3 text-xs">
      <p className="font-black text-neutral-800">{name}</p>
      <p className="text-neutral-500 mt-0.5 tabular-nums">
        {value} · {Math.round((value / total) * 100)}%
      </p>
    </div>
  );
}

export function AdminDonutChart({
  title,
  subtitle,
  data,
  icon,
  height = 210,
  className = "",
}: AdminDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const enriched = data.map((d) => ({ ...d, total }));

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
        <PieChart>
          <Pie
            data={enriched}
            cx="50%"
            cy="44%"
            innerRadius="50%"
            outerRadius="70%"
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {enriched.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", fontWeight: "700", paddingTop: "6px" }}
            formatter={(value) => (
              <span style={{ color: "#64748b" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </LiquidGlassSurface>
  );
}
