import { pool } from "@/lib/db";
import { isAvatarStyleId } from "@/components/user/avatar-styles";

import {
  hashPassword,
  needsPasswordUpgrade,
  normalizeEmail,
  validatePasswordPolicy,
  verifyPassword,
} from "./passwords";

export type AuthUserRecord = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_style: string | null;
  password_hash: string;
  password_algorithm: string | null;
  status: string;
  email_verified_at: Date | null;
};

export type AuthResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; code: "invalid_credentials" | "email_not_verified" | "inactive_user" };

export async function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const { rows } = await pool.query<AuthUserRecord>(
    `
      SELECT id, email, display_name, avatar_style, password_hash, password_algorithm, status, email_verified_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  return rows[0] ?? null;
}

export async function createUserWithPassword(params: {
  email: string;
  password: string;
  displayName?: string | null;
}) {
  const normalizedEmail = normalizeEmail(params.email);
  const passwordPolicy = validatePasswordPolicy(params.password);

  if (!passwordPolicy.ok) {
    throw new Error(passwordPolicy.message ?? "Invalid password.");
  }

  const passwordHash = await hashPassword(params.password);

  const { rows } = await pool.query<{
    id: string;
    email: string;
    display_name: string | null;
  }>(
    `
      INSERT INTO users (
        email,
        display_name,
        avatar_style,
        password,
        password_hash,
        password_algorithm,
        status,
        updated_at
      )
      VALUES ($1, $2, 'mondrian-primary', $3, $3, 'scrypt', 'active', NOW())
      RETURNING id, email, display_name
    `,
    [normalizedEmail, params.displayName?.trim() || null, passwordHash]
  );

  return rows[0];
}

export async function authenticateUserWithPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    return { ok: false as const, code: "invalid_credentials" };
  }

  if (user.status !== "active") {
    return { ok: false as const, code: "inactive_user" };
  }

  const passwordMatches = await verifyPassword(password, user.password_hash, user.password_algorithm);
  if (!passwordMatches) {
    return { ok: false as const, code: "invalid_credentials" };
  }

  if (!user.email_verified_at) {
    return { ok: false as const, code: "email_not_verified" };
  }

  if (await needsPasswordUpgrade(user.password_hash, user.password_algorithm)) {
    const upgradedHash = await hashPassword(password);
    await pool.query(
      `
        UPDATE users
        SET password_hash = $2,
            password_algorithm = 'scrypt',
            updated_at = NOW()
        WHERE id = $1
      `,
      [user.id, upgradedHash]
    );
  }

  await pool.query(
    `
      UPDATE users
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `,
    [user.id]
  );

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function getCurrentUserProfile(userId: string) {
  const { rows } = await pool.query<{
    id: string;
    email: string;
    display_name: string | null;
    avatar_style: string | null;
    email_verified_at: Date | null;
  }>(
    `
      SELECT id, email, display_name, avatar_style, email_verified_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const user = rows[0];
  if (!user) {
    throw new Error("User profile not found.");
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarStyle: user.avatar_style,
    emailVerifiedAt: user.email_verified_at?.toISOString() ?? null,
  };
}

export async function updateCurrentUserProfile(params: {
  userId: string;
  displayName: string;
  avatarStyle: string;
}) {
  const avatarStyle = isAvatarStyleId(params.avatarStyle)
    ? params.avatarStyle
    : "mondrian-primary";

  const { rows } = await pool.query<{
    id: string;
    email: string;
    display_name: string | null;
    avatar_style: string | null;
    email_verified_at: Date | null;
  }>(
    `
      UPDATE users
      SET display_name = $2,
          avatar_style = $3,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, display_name, avatar_style, email_verified_at
    `,
    [params.userId, params.displayName.trim() || null, avatarStyle]
  );

  const user = rows[0];
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarStyle: user.avatar_style,
    emailVerifiedAt: user.email_verified_at?.toISOString() ?? null,
  };
}

export async function getUserForPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const { rows } = await pool.query<{
    id: string;
    email: string;
    status: string;
  }>(
    `
      SELECT id, email, status
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  const user = rows[0];
  if (!user || user.status !== "active") {
    return null;
  }

  return user;
}

export async function changeCurrentUserPassword(params: {
  userId: string;
  currentPassword: string;
  nextPassword: string;
}) {
  const passwordPolicy = validatePasswordPolicy(params.nextPassword);

  if (!passwordPolicy.ok) {
    return {
      ok: false as const,
      code: "invalid_password" as const,
      message: passwordPolicy.message ?? "Invalid password.",
    };
  }

  const { rows } = await pool.query<AuthUserRecord>(
    `
      SELECT id, email, display_name, avatar_style, password_hash, password_algorithm, status, email_verified_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [params.userId]
  );

  const user = rows[0];
  if (!user || user.status !== "active") {
    return {
      ok: false as const,
      code: "invalid_credentials" as const,
      message: "Account not available.",
    };
  }

  const currentMatches = await verifyPassword(
    params.currentPassword,
    user.password_hash,
    user.password_algorithm
  );

  if (!currentMatches) {
    return {
      ok: false as const,
      code: "invalid_current_password" as const,
      message: "Current password is incorrect.",
    };
  }

  const nextHash = await hashPassword(params.nextPassword);

  await pool.query(
    `
      UPDATE users
      SET password = $2,
          password_hash = $2,
          password_algorithm = 'scrypt',
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.userId, nextHash]
  );

  await pool.query(
    `
      UPDATE user_password_reset_tokens
      SET consumed_at = NOW()
      WHERE user_id = $1
        AND consumed_at IS NULL
    `,
    [params.userId]
  );

  return { ok: true as const };
}
