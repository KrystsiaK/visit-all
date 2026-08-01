"use client";

import { useState, useEffect } from "react";
import { usePortConsumer } from "@synarava/wiring-engine";
import { TrendingUp, Users, MousePointer2, BarChart2 } from "lucide-react";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { AdminAreaChart } from "./charts/AdminAreaChart";
import { AdminBarChart } from "./charts/AdminBarChart";
import { AdminDonutChart } from "./charts/AdminDonutChart";
import { KpiCard } from "./kpi/KpiCard";
import { getAdminAnalyticsData } from "../actions";
import type { AnalyticsData, DateRange } from "../types";

const EMPTY: AnalyticsData = {
  dau: [],
  contentCreated: [],
  topEvents: [],
  usersByRole: [],
  retentionRate: null,
  avgSessionEvents: null,
};

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const dateRange = usePortConsumer<DateRange | null>("analytics-tab", "date_in", null);

  useEffect(() => {
    setLoading(true);
    getAdminAnalyticsData(dateRange?.from, dateRange?.to)
      .then(setData)
      .finally(() => setLoading(false));
  }, [dateRange]);

  const dauData = data.dau.map((d) => ({ date: d.date.slice(5), dau: d.count }));
  const contentData = data.contentCreated.map((d) => ({
    date: d.date.slice(5),
    pins: d.pins,
    traces: d.traces,
    areas: d.areas,
  }));
  const rolesData = data.usersByRole.map((r) => ({ name: r.role, value: r.count }));
  const eventsData = data.topEvents.map((e) => ({
    name: e.event_type.replace("admin.", "").replace(/\./g, " "),
    count: e.count,
  }));

  const totalDau = dauData.reduce((s, d) => s + d.dau, 0);
  const avgDau = dauData.length > 0 ? Math.round(totalDau / dauData.length) : 0;
  const peakDau = dauData.length > 0 ? Math.max(...dauData.map((d) => d.dau)) : 0;
  const totalEvents = data.topEvents.reduce((s, e) => s + e.count, 0);

  return (
    <div className={`flex flex-col gap-5 transition-opacity ${loading ? "opacity-60" : ""}`}>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Avg DAU"
          value={avgDau.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          iconColor="#0000ff"
          sublabel="Daily active users"
        />
        <KpiCard
          label="Peak DAU"
          value={peakDau.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="#10b981"
          sublabel="Highest single day"
        />
        <KpiCard
          label="Total Events"
          value={totalEvents.toLocaleString()}
          icon={<MousePointer2 className="w-5 h-5" />}
          iconColor="#f59e0b"
          sublabel="In selected period"
        />
        <KpiCard
          label="Event Types"
          value={data.topEvents.length}
          icon={<BarChart2 className="w-5 h-5" />}
          iconColor="#8b5cf6"
          sublabel="Distinct tracked events"
        />
      </div>

      {/* DAU + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminAreaChart
          title="Daily Active Users"
          subtitle="Unique users with telemetry events per day"
          data={dauData}
          xKey="date"
          series={[{ key: "dau", label: "DAU", color: "#0000ff" }]}
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <AdminAreaChart
          title="Content Created"
          subtitle="New pins, traces and areas per day"
          data={contentData}
          xKey="date"
          series={[
            { key: "pins", label: "Pins", color: "#b7102a" },
            { key: "traces", label: "Traces", color: "#f59e0b" },
            { key: "areas", label: "Areas", color: "#10b981" },
          ]}
        />
      </div>

      {/* Events + Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AdminBarChart
          title="Top Telemetry Events"
          subtitle="Most frequent actions in period"
          data={eventsData}
          dataKey="count"
          nameKey="name"
          color="#0000ff"
          horizontal
          height={250}
          className="lg:col-span-2"
        />
        <AdminDonutChart
          title="User Roles"
          subtitle="All-time role distribution"
          data={rolesData.length > 0 ? rolesData : [{ name: "user", value: 1 }]}
          height={250}
        />
      </div>

      {/* Future sections placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <LiquidGlassSurface
          variant="frosted-glass"
          tone="neutral"
          effect="default"
          className="p-6 rounded-[24px] border border-black/5 bg-white/50 shadow-xs flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-neutral-700 tracking-wide">
                Retention Funnel
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">D1 / D7 / D30 cohort retention</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-xs font-black uppercase text-neutral-300 tracking-widest">
                Coming Soon
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Requires session tracking integration
              </p>
            </div>
          </div>
        </LiquidGlassSurface>

        <LiquidGlassSurface
          variant="frosted-glass"
          tone="neutral"
          effect="default"
          className="p-6 rounded-[24px] border border-black/5 bg-white/50 shadow-xs flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <MousePointer2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-neutral-700 tracking-wide">
                Geographic Distribution
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">Users by country / region</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-xs font-black uppercase text-neutral-300 tracking-widest">
                Coming Soon
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Connect Google Analytics or IP geolocation
              </p>
            </div>
          </div>
        </LiquidGlassSurface>
      </div>
    </div>
  );
}