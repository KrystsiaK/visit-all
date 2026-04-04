import { createHash, randomBytes } from "crypto";

import { pool } from "@/lib/db";
import { authDebug } from "@/lib/auth/debug";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

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

async function sendVerificationEmail(params: { email: string; verificationUrl: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const authEmailFrom = process.env.AUTH_EMAIL_FROM;

  if (!resendApiKey || !authEmailFrom) {
    console.info(
      `[auth] verification email fallback for ${params.email}: ${params.verificationUrl}`
    );
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
      subject: "Verify your Visit account",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#171717">
          <h1 style="font-size:24px;margin-bottom:16px">Verify your account</h1>
          <p style="margin-bottom:16px">Confirm your email address to activate your Visit account.</p>
          <p style="margin-bottom:24px">
            <a href="${params.verificationUrl}" style="display:inline-block;padding:12px 18px;background:#00327d;color:#fff;text-decoration:none;font-weight:700;text-transform:uppercase;letter-spacing:.12em">
              Verify Email
            </a>
          </p>
          <p style="color:#525252;font-size:13px">This link expires in 24 hours.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send verification email.");
  }
}

export async function issueEmailVerification(userId: string, email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await pool.query(
    `
      UPDATE user_email_verification_tokens
      SET consumed_at = NOW()
      WHERE user_id = $1
        AND consumed_at IS NULL
    `,
    [userId]
  );

  await pool.query(
    `
      INSERT INTO user_email_verification_tokens (
        user_id,
        email,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
    `,
    [userId, email, tokenHash, expiresAt]
  );

  const verificationUrl = `${getAppBaseUrl()}/verify-email?token=${encodeURIComponent(rawToken)}`;
  authDebug("verify_email.issued", { userId, email, expiresAt: expiresAt.toISOString() });
  await sendVerificationEmail({
    email,
    verificationUrl,
  });

  return { verificationUrl };
}

export async function consumeEmailVerificationToken(rawToken: string) {
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
        FROM user_email_verification_tokens
        WHERE token_hash = $1
        LIMIT 1
        FOR UPDATE
      `,
      [tokenHash]
    );

    const token = tokenResult.rows[0];

    if (!token || token.consumed_at || token.expires_at.getTime() < Date.now()) {
      authDebug("verify_email.consume_rejected", {
        found: Boolean(token),
        consumed: Boolean(token?.consumed_at),
        expired: Boolean(token && token.expires_at.getTime() < Date.now()),
      });
      await client.query("ROLLBACK");
      return { ok: false as const };
    }

    await client.query(
      `
        UPDATE user_email_verification_tokens
        SET consumed_at = NOW()
        WHERE id = $1
      `,
      [token.id]
    );

    await client.query(
      `
        UPDATE users
        SET email_verified_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [token.user_id]
    );

    await client.query("COMMIT");
    authDebug("verify_email.consume_success", { userId: token.user_id });
    return { ok: true as const };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
