"use client";

import { useState } from "react";
import { WiringEngineProvider } from "@synarava/wiring-engine";
import { adminWiringConfig, ADMIN_BUS_ID } from "../bus/admin-bus";
import { AdminSidebar } from "./AdminSidebar";
import { DateRangePicker } from "./DateRangePicker";
import { OverviewTab } from "./OverviewTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { UsersTab } from "./UsersTab";
import { RevenueTab } from "./RevenueTab";
import { SupportTab } from "./SupportTab";
import { IntegrationsTab } from "./IntegrationsTab";
import { TelemetryTab } from "./TelemetryTab";
import type { AdminTab, DashboardStats, SystemIntegration } from "../types";

const TAB_TITLES: Record<AdminTab, string> = {
  overview: "Overview",
  analytics: "Analytics",
  users: "Users & Roles",
  revenue: "Revenue",
  support: "Support",
  integrations: "Integrations",
  telemetry: "Telemetry Logs",
};

const DATE_RANGE_TABS: AdminTab[] = ["overview", "analytics", "revenue", "telemetry"];

interface AdminLayoutProps {
  user: {
    email: string;
    displayName: string | null;
    avatarStyle: string | null;
    role: string;
  };
  initialTab?: AdminTab;
  initialStats: DashboardStats;
  initialUsers: any[];
  initialIntegrations: SystemIntegration[];
  initialLogsData: { logs: any[]; totalCount: number; totalPages: number };
}

export function AdminLayout({
  user,
  initialTab = "overview",
  initialStats,
  initialUsers,
  initialIntegrations,
  initialLogsData,
}: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [refreshKey, setRefreshKey] = useState(0);

  const showDateRange = DATE_RANGE_TABS.includes(activeTab);

  return (
    <WiringEngineProvider busId={ADMIN_BUS_ID} config={adminWiringConfig}>
      <div className="relative min-h-screen w-full bg-[#f7f8fc] font-sans">
        {/* Decorative background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0000ff]/4 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#b7102a]/4 blur-[150px]" />
          <div className="absolute top-[35%] right-[15%] w-[35%] h-[35%] rounded-full bg-amber-200/10 blur-[120px]" />
        </div>

        <div className="relative z-10 flex h-screen overflow-hidden p-4 gap-4">
          {/* Sidebar */}
          <AdminSidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main content */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
            {/* Top bar: section title + date range */}
            <div className="shrink-0 bg-white/60 backdrop-blur-sm border border-black/5 rounded-[24px] px-5 py-3.5 shadow-xs">
              <DateRangePicker
                sectionTitle={TAB_TITLES[activeTab]}
                onRefresh={showDateRange ? () => setRefreshKey((k) => k + 1) : undefined}
              />
            </div>

            {/* Tab content */}
            <div className="flex-1 pb-4">
              {activeTab === "overview" && (
                <OverviewTab
                  key={`overview-${refreshKey}`}
                  initialStats={initialStats}
                />
              )}
              {activeTab === "analytics" && (
                <AnalyticsTab key={`analytics-${refreshKey}`} />
              )}
              {activeTab === "users" && (
                <UsersTab initialUsers={initialUsers} currentUserRole={user.role} />
              )}
              {activeTab === "revenue" && (
                <RevenueTab key={`revenue-${refreshKey}`} />
              )}
              {activeTab === "support" && <SupportTab currentUserRole={user.role} />}
              {activeTab === "integrations" && (
                <IntegrationsTab
                  initialIntegrations={initialIntegrations}
                  currentUserRole={user.role}
                />
              )}
              {activeTab === "telemetry" && (
                <TelemetryTab
                  key={`telemetry-${refreshKey}`}
                  initialLogsData={initialLogsData}
                  currentUserRole={user.role}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </WiringEngineProvider>
  );
}
