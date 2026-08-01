"use client";

import { LiquidGlassSurface } from "@synarava/liquid-glass";
import type { ReactNode } from "react";

export interface HeatmapCell {
  day: number;  // 0=Mon … 6=Sun
  hour: number; // 0-23
  count: number;
}

interface ActivityHeatmapProps {
  title: string;
  subtitle?: string;
  data: HeatmapCell[];
  icon?: ReactNode;
  className?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL = 13;
const GAP = 2;

function intensity(count: number, max: number): string {
  if (count === 0 || max === 0) return "rgba(0,0,0,0.05)";
  const r = count / max;
  if (r < 0.2) return "rgba(0,0,255,0.12)";
  if (r < 0.4) return "rgba(0,0,255,0.28)";
  if (r < 0.65) return "rgba(0,0,255,0.50)";
  if (r < 0.85) return "rgba(0,0,255,0.70)";
  return "rgba(0,0,255,0.90)";
}

export function ActivityHeatmap({ title, subtitle, data, icon, className = "" }: ActivityHeatmapProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const grid = (day: number, hour: number) =>
    data.find((d) => d.day === day && d.hour === hour)?.count ?? 0;

  const W = HOURS.length * (CELL + GAP) + 32;
  const H = DAYS.length * (CELL + GAP) + 26;

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

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }} className="w-full">
          {DAYS.map((d, di) => (
            <text
              key={d}
              x={0}
              y={26 + di * (CELL + GAP) + CELL / 2 + 3.5}
              fontSize={8.5}
              fontWeight={700}
              fill="#94a3b8"
            >
              {d}
            </text>
          ))}
          {HOURS.map((h, hi) =>
            h % 4 === 0 ? (
              <text
                key={h}
                x={32 + hi * (CELL + GAP) + CELL / 2}
                y={13}
                fontSize={8.5}
                fontWeight={700}
                fill="#94a3b8"
                textAnchor="middle"
              >
                {h}h
              </text>
            ) : null
          )}
          {DAYS.map((_, di) =>
            HOURS.map((h, hi) => {
              const count = grid(di, h);
              return (
                <rect
                  key={`${di}-${h}`}
                  x={32 + hi * (CELL + GAP)}
                  y={26 + di * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={3}
                  fill={intensity(count, max)}
                >
                  <title>
                    {DAYS[di]} {h}:00 — {count} events
                  </title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
        <span>Less</span>
        {[0, 0.2, 0.4, 0.65, 1].map((r, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-[3px]"
            style={{
              background: r === 0 ? "rgba(0,0,0,0.05)" : `rgba(0,0,255,${0.12 + r * 0.78})`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </LiquidGlassSurface>
  );
}
