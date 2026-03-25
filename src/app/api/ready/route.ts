import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/lib/db";
import { getStorageReadiness } from "@/lib/storage";

export async function GET() {
  const database = await checkDatabaseConnection();
  const storage = getStorageReadiness();
  const authSecretConfigured = Boolean(process.env.AUTH_SECRET);

  const ready = database.ok && storage.ok && authSecretConfigured;

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      checks: {
        database,
        storage,
        authSecret: {
          ok: authSecretConfigured,
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
