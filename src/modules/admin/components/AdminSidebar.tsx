"use client";

import Link from "next/link";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { UserAvatarBadge } from "@synarava/ui-kit";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  DollarSign,
  LifeBuoy,
  Settings,
  Activity,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import type { AdminTab } from "../types";

interface NavItem {
  id: AdminTab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard, roles: ["support", "admin", "superadmin"] },
  { id: "analytics", label: "Analytics", Icon: TrendingUp, roles: ["admin", "superadmin"] },
  { id: "users", label: "Users & Roles", Icon: Users, roles: ["support", "admin", "superadmin"] },
  { id: "revenue", label: "Revenue", Icon: DollarSign, roles: ["admin", "superadmin"], badge: "Soon" },
  { id: "support", label: "Support", Icon: LifeBuoy, roles: ["support", "admin", "superadmin"] },
  { id: "integrations", label: "Integrations", Icon: Settings, roles: ["admin", "superadmin"] },
  { id: "telemetry", label: "Telemetry", Icon: Activity, roles: ["support", "admin", "superadmin"] },
];

interface AdminSidebarProps {
  user: {
    email: string;
    displayName: string | null;
    avatarStyle: string | null;
    role: string;
  };
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({ user, activeTab, onTabChange }: AdminSidebarProps) {
  const visible = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <LiquidGlassSurface
      variant="frosted-glass"
      tone="neutral"
      effect="amplified"
      className="w-56 shrink-0 rounded-[28px] border border-black/5 bg-white/70 shadow-xs flex flex-col p-3 gap-1"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-black/10 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <div className="min-w-0">
          <p className="text-[13px] font-black uppercase tracking-tight text-neutral-900 leading-none">
            Admin
          </p>
          <span className="text-[10px] font-black uppercase text-[#b7102a] tracking-wider">
            {user.role}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {visible.map(({ id, label, Icon, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                active
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-black/5 hover:text-neutral-900"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  active ? "text-white" : "text-neutral-400 group-hover:text-neutral-600"
                }`}
              />
              <span className="text-[11px] font-black uppercase tracking-wide flex-1 leading-none">
                {label}
              </span>
              {badge && (
                <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md tracking-wide shrink-0">
                  {badge}
                </span>
              )}
              {active && (
                <ChevronRight className="w-3 h-3 text-white/50 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-black/5 pt-3 mt-1">
        <div className="flex items-center gap-2 px-2">
          <UserAvatarBadge styleId={user.avatarStyle || "mondrian-primary"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-neutral-900 truncate leading-tight">
              {user.displayName || user.email.split("@")[0]}
            </p>
            <p className="text-[10px] text-neutral-400 truncate leading-tight">{user.email}</p>
          </div>
        </div>
      </div>
    </LiquidGlassSurface>
  );
}
