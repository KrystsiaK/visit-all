import { createHash } from "crypto";
import type { PoolClient } from "pg";

import { pool } from "@/lib/db";

type RateLimitScope = "auth_login" | "media_upload";

type RateLimitOptions = {
  scope: RateLimitScope;
  identifier: string;
  limit: number;
  windowMs: number;
  blockMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

function hashIdentifier(identifier: string) {
  return createHash("sha256").update(identifier).digest("hex");
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function incrementRateLimit(
  client: PoolClient,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now = new Date();
  const identifierHash = hashIdentifier(options.identifier);

  const { rows } = await client.query<{
    attempts: number;
    window_started_at: Date;
    blocked_until: Date | null;
  }>(
    `
      SELECT attempts, window_started_at, blocked_until
      FROM rate_limit_buckets
      WHERE scope = $1 AND identifier_hash = $2
      FOR UPDATE
    `,
    [options.scope, identifierHash]
  );

  const existingRow = rows[0];

  if (!existingRow) {
    await client.query(
      `
        INSERT INTO rate_limit_buckets (
          scope, identifier_hash, attempts, window_started_at, blocked_until, updated_at
        )
        VALUES ($1, $2, 1, NOW(), NULL, NOW())
      `,
      [options.scope, identifierHash]
    );

    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterMs: 0,
    };
  }

  if (existingRow.blocked_until && existingRow.blocked_until > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existingRow.blocked_until.getTime() - now.getTime(),
    };
  }

  const windowExpired =
    now.getTime() - existingRow.window_started_at.getTime() >= options.windowMs;

  if (windowExpired) {
    await client.query(
      `
        UPDATE rate_limit_buckets
        SET attempts = 1,
            window_started_at = NOW(),
            blocked_until = NULL,
            updated_at = NOW()
        WHERE scope = $1 AND identifier_hash = $2
      `,
      [options.scope, identifierHash]
    );

    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterMs: 0,
    };
  }

  const nextAttempts = existingRow.attempts + 1;

  if (nextAttempts > options.limit) {
    const blockedUntil = new Date(now.getTime() + options.blockMs);

    await client.query(
      `
        UPDATE rate_limit_buckets
        SET attempts = $3,
            blocked_until = $4,
            updated_at = NOW()
        WHERE scope = $1 AND identifier_hash = $2
      `,
      [options.scope, identifierHash, nextAttempts, blockedUntil]
    );

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: options.blockMs,
    };
  }

  await client.query(
    `
      UPDATE rate_limit_buckets
      SET attempts = $3,
          blocked_until = NULL,
          updated_at = NOW()
      WHERE scope = $1 AND identifier_hash = $2
    `,
    [options.scope, identifierHash, nextAttempts]
  );

  return {
    allowed: true,
    remaining: Math.max(options.limit - nextAttempts, 0),
    retryAfterMs: 0,
  };
}

export async function checkRateLimit(options: RateLimitOptions) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await incrementRateLimit(client, options);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function assertRateLimit(options: RateLimitOptions) {
  const result = await checkRateLimit(options);
  if (!result.allowed) {
    throw new Error("Too many requests. Please try again later.");
  }
}
