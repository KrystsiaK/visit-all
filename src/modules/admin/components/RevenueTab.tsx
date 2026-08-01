"use client";

import { usePortConsumer } from "@synarava/wiring-engine";
import { DollarSign, CreditCard, TrendingUp, ShoppingCart, Zap } from "lucide-react";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { KpiCard } from "./kpi/KpiCard";
import type { DateRange } from "../types";

const INTEGRATIONS = [
  { name: "Stripe", icon: CreditCard, color: "#635bff", desc: "Payments & subscriptions", status: "not-connected" },
  { name: "Revenue Cat", icon: ShoppingCart, color: "#f59e0b", desc: "In-app purchases & entitlements", status: "not-connected" },
  { name: "Paddle", icon: DollarSign, color: "#0ea5e9", desc: "SaaS billing & tax compliance", status: "not-connected" },
];

export function RevenueTab() {
  const dateRange = usePortConsumer<DateRange | null>("revenue-tab", "date_in", null);
  void dateRange;

  return (
    <div className="flex flex-col gap-5">
      {/* KPI placeholders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="MRR"
          value="—"
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="#10b981"
          sublabel="Monthly recurring revenue"
        />
        <KpiCard
          label="ARR"
          value="—"
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="#0000ff"
          sublabel="Annual run rate"
        />
        <KpiCard
          label="New Customers"
          value="—"
          icon={<ShoppingCart className="w-5 h-5" />}
          iconColor="#f59e0b"
          sublabel="In selected period"
        />
        <KpiCard
          label="Churn Rate"
          value="—"
          icon={<CreditCard className="w-5 h-5" />}
          iconColor="#b7102a"
          sublabel="Monthly churn"
        />
      </div>

      {/* Connect integrations */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone="neutral"
        effect="amplified"
        className="p-8 rounded-[28px] border border-black/5 bg-white/60 shadow-xs flex flex-col items-center gap-6 text-center"
      >
        <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
          <DollarSign className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
            Revenue Dashboard
          </h2>
          <p className="text-sm text-neutral-500 font-medium mt-2 max-w-md">
            Connect a payment provider to start tracking MRR, ARR, churn and customer metrics in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          {INTEGRATIONS.map(({ name, icon: Icon, color, desc }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 p-5 bg-white/80 border border-black/5 rounded-2xl shadow-xs hover:bg-white transition-colors cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: color + "18" }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-black uppercase text-neutral-800 tracking-wide">{name}</p>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{desc}</p>
              </div>
              <span className="text-[10px] font-black uppercase text-neutral-300 tracking-widest border border-neutral-200 px-2.5 py-1 rounded-xl group-hover:border-emerald-200 group-hover:text-emerald-500 transition-colors">
                Connect
              </span>
            </div>
          ))}
        </div>
      </LiquidGlassSurface>

      {/* Upcoming features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { title: "Revenue Over Time", desc: "MRR / ARR trend chart with forecasting" },
          { title: "Subscription Cohorts", desc: "Monthly cohort retention and expansion revenue" },
          { title: "Transaction Log", desc: "Filterable table of all charges and refunds" },
          { title: "Plan Distribution", desc: "Donut chart of users per subscription tier" },
        ].map(({ title, desc }) => (
          <LiquidGlassSurface
            key={title}
            variant="frosted-glass"
            tone="neutral"
            effect="default"
            className="p-5 rounded-[24px] border border-black/5 bg-white/40 shadow-xs flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-neutral-600 tracking-wide">{title}</p>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{desc}</p>
            </div>
            <span className="ml-auto text-[9px] font-black uppercase text-neutral-300 tracking-widest shrink-0">
              Soon
            </span>
          </LiquidGlassSurface>
        ))}
      </div>
    </div>
  );
}
