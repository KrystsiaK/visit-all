import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getAdminCurrentUser,
  getAdminDashboardStats,
  getAdminUsers,
  getSystemIntegrations,
  getTelemetryLogs,
} from "@/modules/admin/actions";
import { AdminLayout } from "@/modules/admin/components/AdminLayout";
import type { AdminTab } from "@/modules/admin/types";

interface AdminPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getAdminCurrentUser();

  if (!user || user.status !== "active") {
    redirect("/login");
  }

  const allowedRoles = ["support", "admin", "superadmin"];

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center font-sans p-6 bg-[#f7f8fc]">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#b7102a]/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0000ff]/5 blur-[120px]" />
        </div>
        <LiquidGlassSurface
          variant="prismatic-glass"
          tone="rose"
          effect="amplified"
          className="w-full max-w-[440px] p-8 rounded-[28px] border border-[#b7102a]/15 bg-white/60 shadow-xl flex flex-col items-center text-center gap-6 z-10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b7102a] text-white shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
              Restricted Area
            </h1>
            <p className="text-xs text-[#b7102a] font-black uppercase tracking-widest">
              Access Denied
            </p>
          </div>
          <p className="text-sm leading-relaxed text-neutral-600 font-medium">
            Your account <strong>({user.email})</strong> does not have sufficient administrative
            privileges. Contact a super administrator if you believe this is an error.
          </p>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-colors py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to App
          </Link>
        </LiquidGlassSurface>
      </div>
    );
  }

  const params = await searchParams;
  const activeTab = (params?.tab ?? "overview") as AdminTab;

  const [initialStats, initialUsers, initialIntegrations, initialLogsData] = await Promise.all([
    getAdminDashboardStats(),
    getAdminUsers(),
    getSystemIntegrations(),
    getTelemetryLogs(1),
  ]);

  return (
    <AdminLayout
      user={{
        email: user.email,
        displayName: user.display_name,
        avatarStyle: user.avatar_style,
        role: user.role,
      }}
      initialTab={activeTab}
      initialStats={initialStats}
      initialUsers={initialUsers}
      initialIntegrations={initialIntegrations}
      initialLogsData={initialLogsData}
    />
  );
}
