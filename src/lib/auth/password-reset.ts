import { createHash, randomBytes } from "crypto";

import { pool } from "@/lib/db";
import { authDebug } from "@/lib/auth/debug";
import { hashPassword, validatePasswordPolicy } from "./passwords";

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60 * 2;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function sendPasswordResetEmail(params: { email: string; resetUrl: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const authEmailFrom = process.env.AUTH_EMAIL_FROM;

  if (!resendApiKey || !authEmailFrom) {
    console.info(`[auth] password reset email fallback for ${params.email}: ${params.resetUrl}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: authEmailFrom,
      to: params.email,
      subject: "Reset your Visit password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#171717">
          <h1 style="font-size:24px;margin-bottom:16px">Reset your password</h1>
          <p style="margin-bottom:16px">Use the link below to choose a new password for your Visit account.</p>
          <p style="margin-bottom:24px">
            <a href="${params.resetUrl}" style="display:inline-block;padding:12px 18px;background:#00327d;color:#fff;text-decoration:none;font-weight:700;text-transform:uppercase;letter-spacing:.12em">
              Reset Password
            </a>
          </p>
          <p style="color:#525252;font-size:13px">This link expires in 2 hours.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send password reset email.");
  }
}

export async function issuePasswordReset(userId: string, email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await pool.query(
    `
      UPDATE user_password_reset_tokens
      SET consumed_at = NOW()
      WHERE user_id = $1
        AND consumed_at IS NULL
    `,
    [userId]
  );

  await pool.query(
    `
      INSERT INTO user_password_reset_tokens (
        user_id,
        email,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
    `,
    [userId, email, tokenHash, expiresAt]
  );

  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
  authDebug("password_reset.issued", { userId, email, expiresAt: expiresAt.toISOString() });
  await sendPasswordResetEmail({ email, resetUrl });
  return { resetUrl };
}

export async function resetPasswordWithToken(rawToken: string, password: string) {
  const passwordPolicy = validatePasswordPolicy(password);

  if (!passwordPolicy.ok) {
    authDebug("password_reset.invalid_password", {});
    return {
      ok: false as const,
      code: "invalid_password" as const,
      message: passwordPolicy.message ?? "Invalid password.",
    };
  }

  const tokenHash = hashToken(rawToken);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tokenResult = await client.query<{
      id: string;
      user_id: string;
      expires_at: Date;
      consumed_at: Date | null;
    }>(
      `
        SELECT id, user_id, expires_at, consumed_at
        FROM user_password_reset_tokens
        WHERE token_hash = $1
        LIMIT 1
        FOR UPDATE
      `,
      [tokenHash]
    );

    const token = tokenResult.rows[0];

    if (!token || token.consumed_at || token.expires_at.getTime() < Date.now()) {
      authDebug("password_reset.consume_rejected", {
        found: Boolean(token),
        consumed: Boolean(token?.consumed_at),
        expired: Boolean(token && token.expires_at.getTime() < Date.now()),
      });
      await client.query("ROLLBACK");
      return {
        ok: false as const,
        code: "invalid_token" as const,
        message: "This reset link is invalid or expired.",
      };
    }

    const passwordHash = await hashPassword(password);

    await client.query(
      `
        UPDATE users
        SET password = $2,
            password_hash = $2,
            password_algorithm = 'scrypt',
            updated_at = NOW()
        WHERE id = $1
      `,
      [token.user_id, passwordHash]
    );

    await client.query(
      `
        UPDATE user_password_reset_tokens
        SET consumed_at = NOW()
        WHERE user_id = $1
          AND consumed_at IS NULL
      `,
      [token.user_id]
    );

    await client.query("COMMIT");
    authDebug("password_reset.consume_success", { userId: token.user_id });
    return { ok: true as const };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
