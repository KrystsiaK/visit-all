export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_style: string | null;
  status: string;
  role: string;
  created_at: Date;
  last_login_at: Date | null;
}

export interface DashboardStats {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPins: number;
    totalTraces: number;
    totalAreas: number;
    totalCollections: number;
    totalWidgets: number;
    activeIntegrations: number;
  };
  charts: {
    registrations: Array<{ date: string; count: number }>;
    telemetry: Array<{ date: string; count: number }>;
    eventTypes: Array<{ event_type: string; count: number }>;
    userRoles: Array<{ role: string; count: number }>;
    contentByDay: Array<{ date: string; pins: number; traces: number; areas: number }>;
  };
  system: {
    memory: { rss: number; heapTotal: number; heapUsed: number; external: number };
    uptime: number;
    nodeVersion: string;
    platform: string;
  };
  trends: {
    usersGrowth: number;
    activeUsersGrowth: number;
    pinsGrowth: number;
  };
}

export interface AnalyticsData {
  dau: Array<{ date: string; count: number }>;
  contentCreated: Array<{ date: string; pins: number; traces: number; areas: number }>;
  topEvents: Array<{ event_type: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  retentionRate: number | null;
  avgSessionEvents: number | null;
}

export interface SystemIntegration {
  id: string;
  name: string;
  enabled: boolean;
  api_key: string | null;
  settings: Record<string, unknown>;
  updated_at: Date;
}

export type AdminRole = "user" | "support" | "admin" | "superadmin";
export type AdminTab =
  | "overview"
  | "analytics"
  | "users"
  | "revenue"
  | "support"
  | "integrations"
  | "telemetry";
