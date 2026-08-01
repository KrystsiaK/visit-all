"use client";

import { useState } from "react";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle, MessageSquare, Zap } from "lucide-react";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { KpiCard } from "./kpi/KpiCard";

type TicketStatus = "open" | "in_progress" | "resolved";

interface Ticket {
  id: string;
  subject: string;
  user: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

// Placeholder tickets — replace with real DB query when support table exists
const PLACEHOLDER_TICKETS: Ticket[] = [
  { id: "T-001", subject: "Cannot log in after password reset", user: "user@example.com", status: "open", priority: "high", createdAt: "2026-06-10" },
  { id: "T-002", subject: "Map pins not loading on mobile", user: "mobile@example.com", status: "in_progress", priority: "medium", createdAt: "2026-06-09" },
  { id: "T-003", subject: "Export feature request", user: "power@example.com", status: "open", priority: "low", createdAt: "2026-06-08" },
  { id: "T-004", subject: "Account deletion request", user: "gdpr@example.com", status: "resolved", priority: "high", createdAt: "2026-06-07" },
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; Icon: React.ComponentType<any> }> = {
  open: { label: "Open", color: "text-[#b7102a] bg-rose-50", Icon: AlertCircle },
  in_progress: { label: "In Progress", color: "text-amber-600 bg-amber-50", Icon: Clock },
  resolved: { label: "Resolved", color: "text-emerald-600 bg-emerald-50", Icon: CheckCircle2 },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-[#b7102a]/10 text-[#b7102a]",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-neutral-100 text-neutral-500",
};

interface SupportTabProps {
  currentUserRole: string;
}

export function SupportTab({ currentUserRole }: SupportTabProps) {
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  void currentUserRole;

  const open = PLACEHOLDER_TICKETS.filter((t) => t.status === "open").length;
  const inProgress = PLACEHOLDER_TICKETS.filter((t) => t.status === "in_progress").length;
  const resolved = PLACEHOLDER_TICKETS.filter((t) => t.status === "resolved").length;

  const filtered =
    filter === "all" ? PLACEHOLDER_TICKETS : PLACEHOLDER_TICKETS.filter((t) => t.status === filter);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Open Tickets"
          value={open}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="#b7102a"
        />
        <KpiCard
          label="In Progress"
          value={inProgress}
          icon={<Clock className="w-5 h-5" />}
          iconColor="#f59e0b"
        />
        <KpiCard
          label="Resolved"
          value={resolved}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="#10b981"
        />
        <KpiCard
          label="Avg Response"
          value="—"
          icon={<MessageSquare className="w-5 h-5" />}
          iconColor="#0000ff"
          sublabel="Requires ticketing system"
        />
      </div>

      {/* Ticket list */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone="neutral"
        effect="default"
        className="rounded-[24px] border border-black/5 bg-white/60 shadow-xs overflow-hidden"
      >
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-black/5">
          <h3 className="text-sm font-black uppercase text-neutral-800 tracking-wide flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-neutral-500" />
            Support Tickets
          </h3>
          <div className="flex items-center gap-1 bg-white/80 border border-black/8 rounded-2xl p-1">
            {(["all", "open", "in_progress", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                  filter === f
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="divide-y divide-black/5">
          {filtered.map((ticket) => {
            const { label, color, Icon } = STATUS_CONFIG[ticket.status];
            return (
              <div
                key={ticket.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-black/2 transition-colors"
              >
                <span className="text-[10px] font-black text-neutral-400 font-mono w-10 shrink-0">
                  {ticket.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-800 truncate">{ticket.subject}</p>
                  <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{ticket.user}</p>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-xl tracking-wide shrink-0 ${PRIORITY_COLOR[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
                <div className={`flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1.5 rounded-xl shrink-0 ${color}`}>
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
                <span className="text-[10px] text-neutral-400 font-medium shrink-0 hidden md:block">
                  {ticket.createdAt}
                </span>
              </div>
            );
          })}
        </div>
      </LiquidGlassSurface>

      {/* Connect ticketing system */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone="neutral"
        effect="default"
        className="p-5 rounded-[24px] border border-black/5 bg-white/50 shadow-xs"
      >
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          Connect Ticketing System
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Intercom", "Zendesk", "Linear", "Crisp"].map((name) => (
            <div
              key={name}
              className="flex items-center gap-2.5 px-3 py-3 bg-white/80 border border-black/5 rounded-2xl hover:bg-white transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <span className="text-xs font-black text-neutral-700">{name}</span>
              <span className="ml-auto text-[9px] font-black uppercase text-neutral-300 tracking-widest shrink-0">
                Soon
              </span>
            </div>
          ))}
        </div>
      </LiquidGlassSurface>
    </div>
  );
}
