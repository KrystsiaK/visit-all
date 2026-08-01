"use server";

import { pool } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Helper to check if the current user is authorized as admin/superadmin/support
export async function verifyAdminAccess() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized. Authenticated session required.");
  }

  const { rows } = await pool.query<{ role: string; status: string }>(
    `SELECT role, status FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const user = rows[0];

  if (!user || user.status !== "active") {
    throw new Error("Account is suspended or disabled.");
  }

  const allowedRoles = ["support", "admin", "superadmin"];
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Access denied. Admin permissions required.");
  }

  return { userId, role: user.role };
}

// Fetch the current user's basic info (used by page.tsx instead of inline SQL)
export async function getAdminCurrentUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { rows } = await pool.query<{
    email: string;
    display_name: string | null;
    avatar_style: string | null;
    status: string;
    role: string;
  }>(
    `SELECT email, display_name, avatar_style, status, role FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

// 1. Dashboard metrics and charts
export async function getAdminDashboardStats(from?: string, to?: string) {
  const { role } = await verifyAdminAccess();
  void role;

  const endDate = to ?? new Date().toISOString().split("T")[0];
  const startDate = from ?? new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];

  // Total counts
  const usersCountQuery = pool.query("SELECT COUNT(*)::int as count, COUNT(case when status='active' then 1 end)::int as active_count FROM users");
  const pinsCountQuery = pool.query("SELECT COUNT(*)::int as count FROM pins");
  const tracesCountQuery = pool.query("SELECT COUNT(*)::int as count FROM traces");
  const areasCountQuery = pool.query("SELECT COUNT(*)::int as count FROM areas");
  const collectionsCountQuery = pool.query("SELECT COUNT(*)::int as count FROM collections");
  const widgetsCountQuery = pool.query("SELECT COUNT(*)::int as count FROM widget_instances");
  const integrationsCountQuery = pool.query("SELECT COUNT(*)::int as count FROM system_integrations WHERE enabled = true");

  const [
    usersRes,
    pinsRes,
    tracesRes,
    areasRes,
    collectionsRes,
    widgetsRes,
    integrationsRes
  ] = await Promise.all([
    usersCountQuery,
    pinsCountQuery,
    tracesCountQuery,
    areasCountQuery,
    collectionsCountQuery,
    widgetsCountQuery,
    integrationsCountQuery
  ]);

  // Daily registrations over the selected date range
  const registrationsChartQuery = await pool.query<{ date: string; count: number }>(
    `SELECT TO_CHAR(date_series, 'YYYY-MM-DD') as date, COALESCE(COUNT(u.id)::int, 0) as count
     FROM GENERATE_SERIES($1::date, $2::date, '1 day'::interval) date_series
     LEFT JOIN users u ON DATE_TRUNC('day', u.created_at) = date_series
     GROUP BY date_series ORDER BY date_series ASC`,
    [startDate, endDate]
  );

  // Telemetry activity trend
  const telemetryActivityQuery = await pool.query<{ date: string; count: number }>(
    `SELECT TO_CHAR(date_series, 'YYYY-MM-DD') as date, COALESCE(COUNT(t.id)::int, 0) as count
     FROM GENERATE_SERIES($1::date, $2::date, '1 day'::interval) date_series
     LEFT JOIN telemetry_logs t ON DATE_TRUNC('day', t.created_at) = date_series
     GROUP BY date_series ORDER BY date_series ASC`,
    [startDate, endDate]
  );

  // Log counts by event type in range
  const eventTypesQuery = await pool.query<{ event_type: string; count: number }>(
    `SELECT event_type, COUNT(*)::int as count
     FROM telemetry_logs
     WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
     GROUP BY event_type ORDER BY count DESC LIMIT 6`,
    [startDate, endDate]
  );

  // Users by role distribution
  const userRolesQuery = await pool.query<{ role: string; count: number }>(
    `SELECT role, COUNT(*)::int as count FROM users GROUP BY role ORDER BY count DESC`
  );

  // Content created per day in range
  const contentByDayQuery = await pool.query<{ date: string; pins: number; traces: number; areas: number }>(
    `SELECT TO_CHAR(d, 'YYYY-MM-DD') as date,
       COALESCE((SELECT COUNT(*)::int FROM pins WHERE DATE_TRUNC('day', created_at) = d), 0) as pins,
       COALESCE((SELECT COUNT(*)::int FROM traces WHERE DATE_TRUNC('day', created_at) = d), 0) as traces,
       COALESCE((SELECT COUNT(*)::int FROM areas WHERE DATE_TRUNC('day', created_at) = d), 0) as areas
     FROM GENERATE_SERIES($1::date, $2::date, '1 day'::interval) d
     ORDER BY d ASC`,
    [startDate, endDate]
  );

  // Trends: compare current period vs previous period of same length
  const daysDiff = Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
  );
  const prevEnd = new Date(new Date(startDate).getTime() - 86400000).toISOString().split("T")[0];
  const prevStart = new Date(new Date(startDate).getTime() - daysDiff * 86400000)
    .toISOString()
    .split("T")[0];

  const [prevUsersRes, prevActiveRes, prevPinsRes] = await Promise.all([
    pool.query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM users WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      [prevStart, prevEnd]
    ),
    pool.query<{ count: number }>(
      `SELECT COUNT(DISTINCT user_id)::int as count FROM telemetry_logs WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      [prevStart, prevEnd]
    ),
    pool.query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM pins WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      [prevStart, prevEnd]
    ),
  ]);

  const [currUsersRes, currActiveRes, currPinsRes] = await Promise.all([
    pool.query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM users WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      [startDate, endDate]
    ),
    pool.query<{ count: number }>(
      `SELECT COUNT(DISTINCT user_id)::int as count FROM telemetry_logs WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      [startDate, endDate]
    ),
    pool.query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM pins WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      [startDate, endDate]
    ),
  ]);

  const growthPct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  // CPU and Memory metrics
  const memoryUsage = process.memoryUsage();
  const memoryStats = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  return {
    stats: {
      totalUsers: usersRes.rows[0]?.count ?? 0,
      activeUsers: usersRes.rows[0]?.active_count ?? 0,
      totalPins: pinsRes.rows[0]?.count ?? 0,
      totalTraces: tracesRes.rows[0]?.count ?? 0,
      totalAreas: areasRes.rows[0]?.count ?? 0,
      totalCollections: collectionsRes.rows[0]?.count ?? 0,
      totalWidgets: widgetsRes.rows[0]?.count ?? 0,
      activeIntegrations: integrationsRes.rows[0]?.count ?? 0,
    },
    charts: {
      registrations: registrationsChartQuery.rows,
      telemetry: telemetryActivityQuery.rows,
      eventTypes: eventTypesQuery.rows,
      userRoles: userRolesQuery.rows,
      contentByDay: contentByDayQuery.rows,
    },
    system: {
      memory: memoryStats,
      uptime: Math.round(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
    },
    trends: {
      usersGrowth: growthPct(
        currUsersRes.rows[0]?.count ?? 0,
        prevUsersRes.rows[0]?.count ?? 0
      ),
      activeUsersGrowth: growthPct(
        currActiveRes.rows[0]?.count ?? 0,
        prevActiveRes.rows[0]?.count ?? 0
      ),
      pinsGrowth: growthPct(
        currPinsRes.rows[0]?.count ?? 0,
        prevPinsRes.rows[0]?.count ?? 0
      ),
    },
  };
}

// Analytics: DAU, content trends, retention hints
export async function getAdminAnalyticsData(from?: string, to?: string) {
  await verifyAdminAccess();

  const endDate = to ?? new Date().toISOString().split("T")[0];
  const startDate = from ?? new Date(Date.now() - 29 * 86400000).toISOString().split("T")[0];

  const [dauRes, contentRes, topEventsRes, rolesRes] = await Promise.all([
    pool.query<{ date: string; count: number }>(
      `SELECT TO_CHAR(d, 'YYYY-MM-DD') as date,
         COALESCE(COUNT(DISTINCT tl.user_id)::int, 0) as count
       FROM GENERATE_SERIES($1::date, $2::date, '1 day'::interval) d
       LEFT JOIN telemetry_logs tl ON DATE_TRUNC('day', tl.created_at) = d
       GROUP BY d ORDER BY d ASC`,
      [startDate, endDate]
    ),
    pool.query<{ date: string; pins: number; traces: number; areas: number }>(
      `SELECT TO_CHAR(d, 'YYYY-MM-DD') as date,
         COALESCE((SELECT COUNT(*)::int FROM pins WHERE DATE_TRUNC('day', created_at) = d), 0) as pins,
         COALESCE((SELECT COUNT(*)::int FROM traces WHERE DATE_TRUNC('day', created_at) = d), 0) as traces,
         COALESCE((SELECT COUNT(*)::int FROM areas WHERE DATE_TRUNC('day', created_at) = d), 0) as areas
       FROM GENERATE_SERIES($1::date, $2::date, '1 day'::interval) d ORDER BY d ASC`,
      [startDate, endDate]
    ),
    pool.query<{ event_type: string; count: number }>(
      `SELECT event_type, COUNT(*)::int as count FROM telemetry_logs
       WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
       GROUP BY event_type ORDER BY count DESC LIMIT 10`,
      [startDate, endDate]
    ),
    pool.query<{ role: string; count: number }>(
      `SELECT role, COUNT(*)::int as count FROM users GROUP BY role ORDER BY count DESC`
    ),
  ]);

  return {
    dau: dauRes.rows,
    contentCreated: contentRes.rows,
    topEvents: topEventsRes.rows,
    usersByRole: rolesRes.rows,
    retentionRate: null as number | null,
    avgSessionEvents: null as number | null,
  };
}

// 2. Users Management
export async function getAdminUsers() {
  await verifyAdminAccess();
  const { rows } = await pool.query<{
    id: string;
    email: string;
    display_name: string | null;
    avatar_style: string | null;
    status: string;
    role: string;
    created_at: Date;
    last_login_at: Date | null;
  }>(`
    SELECT id, email, display_name, avatar_style, status, role, created_at, last_login_at
    FROM users
    ORDER BY created_at DESC
  `);
  return rows;
}

export async function updateUserRole(targetUserId: string, nextRole: string) {
  const { role: callerRole } = await verifyAdminAccess();

  // Validate nextRole
  const validRoles = ["user", "support", "admin", "superadmin"];
  if (!validRoles.includes(nextRole)) {
    throw new Error("Invalid role specified.");
  }

  // Support role cannot modify roles.
  if (callerRole === "support") {
    throw new Error("Permission denied. Support staff cannot modify user roles.");
  }

  // Only superadmin can promote/demote to admin/superadmin
  if (callerRole === "admin" && (nextRole === "superadmin" || nextRole === "admin")) {
    throw new Error("Permission denied. Only Superadmins can assign Admin/Superadmin roles.");
  }

  // Prevent changing caller's own role (safety lock)
  const session = await auth();
  if (session?.user?.id === targetUserId) {
    throw new Error("Safety lock: You cannot modify your own role.");
  }

  await pool.query(
    `UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1`,
    [targetUserId, nextRole]
  );

  // Log to telemetry
  await logTelemetryEventInternal("admin.role_update", {
    target_user_id: targetUserId,
    new_role: nextRole
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateUserStatus(targetUserId: string, nextStatus: string) {
  const { role: callerRole } = await verifyAdminAccess();

  if (!["active", "suspended"].includes(nextStatus)) {
    throw new Error("Invalid status specified.");
  }

  if (callerRole === "support") {
    throw new Error("Permission denied. Support staff cannot suspend users.");
  }

  const session = await auth();
  if (session?.user?.id === targetUserId) {
    throw new Error("Safety lock: You cannot suspend your own account.");
  }

  await pool.query(
    `UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1`,
    [targetUserId, nextStatus]
  );

  await logTelemetryEventInternal("admin.status_update", {
    target_user_id: targetUserId,
    new_status: nextStatus
  });

  revalidatePath("/admin");
  return { ok: true };
}

// 3. Service Integrations Management
export async function getSystemIntegrations() {
  await verifyAdminAccess();
  const { rows } = await pool.query<{
    id: string;
    name: string;
    enabled: boolean;
    api_key: string | null;
    settings: any;
    updated_at: Date;
  }>(`
    SELECT id, name, enabled, api_key, settings, updated_at
    FROM system_integrations
    ORDER BY name ASC
  `);
  return rows;
}

export async function updateSystemIntegration(
  id: string,
  enabled: boolean,
  apiKey: string | null,
  settings: any
) {
  const { role: callerRole } = await verifyAdminAccess();

  if (callerRole !== "superadmin" && callerRole !== "admin") {
    throw new Error("Permission denied. Only Admins/Superadmins can configure integrations.");
  }

  await pool.query(
    `
      UPDATE system_integrations
      SET enabled = $2,
          api_key = $3,
          settings = $4,
          updated_at = NOW()
      WHERE id = $1
    `,
    [id, enabled, apiKey, JSON.stringify(settings)]
  );

  await logTelemetryEventInternal("admin.integration_update", {
    integration_id: id,
    enabled
  });

  revalidatePath("/admin");
  return { ok: true };
}

// 4. Telemetry Log Viewer
export async function getTelemetryLogs(page: number = 1, search: string = "") {
  await verifyAdminAccess();

  const limit = 25;
  const offset = (page - 1) * limit;

  let query = `
    SELECT tl.id, tl.event_type, tl.metadata, tl.created_at, u.email as user_email
    FROM telemetry_logs tl
    LEFT JOIN users u ON u.id = tl.user_id
  `;
  const params: any[] = [];

  if (search.trim()) {
    query += ` WHERE tl.event_type ILIKE $1 OR u.email ILIKE $1 OR tl.metadata::text ILIKE $1`;
    params.push(`%${search.trim()}%`);
  }

  query += ` ORDER BY tl.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);

  // Total count for pagination
  let countQuery = `SELECT COUNT(*)::int as count FROM telemetry_logs tl LEFT JOIN users u ON u.id = tl.user_id`;
  const countParams: any[] = [];
  if (search.trim()) {
    countQuery += ` WHERE tl.event_type ILIKE $1 OR u.email ILIKE $1 OR tl.metadata::text ILIKE $1`;
    countParams.push(`%${search.trim()}%`);
  }

  const countRes = await pool.query(countQuery, countParams);
  const totalCount = countRes.rows[0]?.count ?? 0;

  return {
    logs: rows,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

export async function clearTelemetryLogs() {
  const { role: callerRole } = await verifyAdminAccess();

  if (callerRole !== "superadmin") {
    throw new Error("Permission denied. Only Superadmins can clear activity logs.");
  }

  await pool.query("TRUNCATE TABLE telemetry_logs");

  await logTelemetryEventInternal("admin.logs_cleared", {});

  revalidatePath("/admin");
  return { ok: true };
}

// Internal telemetry logging helper
async function logTelemetryEventInternal(eventType: string, metadata: any) {
  const session = await auth();
  const userId = session?.user?.id || null;

  try {
    await pool.query(
      `INSERT INTO telemetry_logs (user_id, event_type, metadata) VALUES ($1, $2, $3)`,
      [userId, eventType, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error("Failed to write telemetry log:", err);
  }
}

// Public client telemetry logging helper (respects session)
export async function logTelemetryEvent(eventType: string, metadata: any) {
  await logTelemetryEventInternal(eventType, metadata);
  return { ok: true };
}
