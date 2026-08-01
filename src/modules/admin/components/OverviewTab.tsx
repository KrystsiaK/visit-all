"use client";

import { useState, useEffect } from "react";
import { usePortConsumer } from "@synarava/wiring-engine";
import { Users, MapPin, Navigation, FolderHeart, Layers, Cpu, Database, Wifi } from "lucide-react";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { KpiCard } from "./kpi/KpiCard";
import { AdminAreaChart } from "./charts/AdminAreaChart";
import { AdminBarChart } from "./charts/AdminBarChart";
import { AdminDonutChart } from "./charts/AdminDonutChart";
import dynamic from "next/dynamic";
const ActivityHeatmap = dynamic(
  () => import("./charts/ActivityHeatmap").then((m) => ({ default: m.ActivityHeatmap })),
  { ssr: false }
);
import { getAdminDashboardStats } from "../actions";
import type { DashboardStats, DateRange } from "../types";

function formatUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s % 60}s`);
  return parts.join(" ");
}

// Placeholder heatmap — generated client-side only to avoid SSR hydration mismatch
function mockHeatmap() {
  const cells = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekend = day >= 5;
      const isPeak = hour >= 9 && hour <= 20;
      const base = isWeekend ? 2 : isPeak ? 8 : 1;
      cells.push({ day, hour, count: Math.floor(Math.random() * base * 3) });
    }
  }
  return cells;
}

interface OverviewTabProps {
  initialStats: DashboardStats;
}

export function OverviewTab({ initialStats }: OverviewTabProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState<{ day: number; hour: number; count: number }[]>([]);

  useEffect(() => {
    setHeatmapData(mockHeatmap());
  }, []);

  const dateRange = usePortConsumer<DateRange | null>("overview-tab", "date_in", null);

  useEffect(() => {
    if (!dateRange) return;
    setLoading(true);
    getAdminDashboardStats(dateRange.from, dateRange.to)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [dateRange]);

  const { stats: s, charts, system, trends } = stats;

  const registrationsData = charts.registrations.map((r) => ({
    date: r.date.slice(5),
    count: r.count,
  }));

  const telemetryData = charts.telemetry.map((r) => ({
    date: r.date.slice(5),
    count: r.count,
  }));

  const contentData = charts.contentByDay.map((r) => ({
    date: r.date.slice(5),
    pins: r.pins,
    traces: r.traces,
    areas: r.areas,
  }));

  const rolesData = (charts.userRoles ?? []).map((r) => ({
    name: r.role,
    value: r.count,
  }));

  const eventTypesData = charts.eventTypes.map((e) => ({
    name: e.event_type.replace("admin.", "").replace(".", " "),
    count: e.count,
  }));

  return (
    <div className={`flex flex-col gap-5 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Users"
          value={s.totalUsers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          iconColor="#0000ff"
          trend={trends?.usersGrowth}
          sublabel={`${s.activeUsers} active`}
        />
        <KpiCard
          label="Pins"
          value={s.totalPins.toLocaleString()}
          icon={<MapPin className="w-5 h-5" />}
          iconColor="#b7102a"
          trend={trends?.pinsGrowth}
          sublabel="Saved locations"
        />
        <KpiCard
          label="Traces"
          value={s.totalTraces.toLocaleString()}
          icon={<Navigation className="w-5 h-5" />}
          iconColor="#f59e0b"
        />
        <KpiCard
          label="Collections"
          value={s.totalCollections.toLocaleString()}
          icon={<FolderHeart className="w-5 h-5" />}
          iconColor="#10b981"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminAreaChart
          title="New Registrations"
          subtitle="Daily new accounts in selected period"
          data={registrationsData}
          xKey="date"
          series={[{ key: "count", label: "Users", color: "#0000ff" }]}
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <AdminAreaChart
          title="Telemetry Activity"
          subtitle="Daily events logged"
          data={telemetryData}
          xKey="date"
          series={[{ key: "count", label: "Events", color: "#b7102a" }]}
          icon={<Layers className="w-4 h-4 text-rose-600" />}
        />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AdminAreaChart
          title="Content Created"
          subtitle="Pins, Traces & Areas per day"
          data={contentData}
          xKey="date"
          series={[
            { key: "pins", label: "Pins", color: "#b7102a" },
            { key: "traces", label: "Traces", color: "#f59e0b" },
            { key: "areas", label: "Areas", color: "#10b981" },
          ]}
          className="lg:col-span-2"
        />
        <AdminDonutChart
          title="User Roles"
          subtitle="Distribution across roles"
          data={rolesData.length > 0 ? rolesData : [{ name: "user", value: 1 }]}
          icon={<Users className="w-4 h-4 text-neutral-500" />}
        />
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ActivityHeatmap
          title="Activity Heatmap"
          subtitle="Hourly event density (Mon–Sun)"
          data={heatmapData}
          className="lg:col-span-2"
        />
        <AdminBarChart
          title="Top Event Types"
          subtitle="Most frequent telemetry events"
          data={eventTypesData}
          dataKey="count"
          nameKey="name"
          color="#0000ff"
          horizontal
          height={210}
        />
      </div>

      {/* System health */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone="neutral"
        effect="default"
        className="p-5 rounded-[24px] border border-black/5 bg-white/60 shadow-xs"
      >
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5 mb-4">
          <Cpu className="w-4 h-4 text-neutral-500" />
          System Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Uptime", value: formatUptime(system.uptime) },
            { label: "RSS Memory", value: `${system.memory.rss} MB` },
            { label: "Heap Used", value: `${system.memory.heapUsed} MB` },
            { label: "Heap Total", value: `${system.memory.heapTotal} MB` },
            { label: "Node.js", value: system.nodeVersion },
            { label: "Platform", value: system.platform },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/75 border border-black/5 rounded-2xl p-3.5 shadow-2xs">
              <span className="block text-[9px] font-black uppercase text-neutral-400 tracking-wider">
                {label}
              </span>
              <span className="block text-sm font-black text-neutral-800 mt-1 truncate tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-black/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
          <span className="text-xs font-bold text-neutral-500">
            <Database className="w-3 h-3 inline mr-1 text-emerald-500" />
            DB Pool Active
          </span>
          <span className="mx-2 text-neutral-200">·</span>
          <Wifi className="w-3 h-3 text-emerald-500" />
          <span className="text-xs font-bold text-neutral-500">
            {s.activeIntegrations} Integration{s.activeIntegrations !== 1 ? "s" : ""} Enabled
          </span>
        </div>
      </LiquidGlassSurface>
    </div>
  );
}
