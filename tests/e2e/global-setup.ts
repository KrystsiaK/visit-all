import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

const E2E_USER = {
  email: "e2e@visitall.test",
  password: "E2ePassword1!",
  displayName: "E2E Curator",
  avatarStyle: "mondrian-primary",
  collectionName: "E2E Places",
} as const;

export default async function globalSetup() {
  const envFilePath = join(process.cwd(), ".env.local");
  if (existsSync(envFilePath)) {
    const rawEnv = readFileSync(envFilePath, "utf8");
    for (const line of rawEnv.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Playwright global setup.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const passwordHash = await bcrypt.hash(E2E_USER.password, 10);

    const existingUser = await client.query<{ id: string }>(
      `
        SELECT id
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [E2E_USER.email]
    );

    let userId = existingUser.rows[0]?.id ?? null;

    if (userId) {
      await client.query(
        `
          UPDATE users
          SET display_name = $2,
              avatar_style = $3,
              password = $4,
              password_hash = $4,
              password_algorithm = 'bcrypt',
              status = 'active',
              email_verified_at = NOW(),
              updated_at = NOW()
          WHERE id = $1
        `,
        [userId, E2E_USER.displayName, E2E_USER.avatarStyle, passwordHash]
      );
    } else {
      const createdUser = await client.query<{ id: string }>(
        `
          INSERT INTO users (
            email,
            display_name,
            avatar_style,
            password,
            password_hash,
            password_algorithm,
            status,
            email_verified_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $4, 'bcrypt', 'active', NOW(), NOW())
          RETURNING id
        `,
        [E2E_USER.email, E2E_USER.displayName, E2E_USER.avatarStyle, passwordHash]
      );

      userId = createdUser.rows[0].id;
    }

    const existingCollection = await client.query<{ id: string }>(
      `
        SELECT id
        FROM collections
        WHERE user_id = $1
          AND name = $2
          AND type = 'pin'
        LIMIT 1
      `,
      [userId, E2E_USER.collectionName]
    );

    if (!existingCollection.rows[0]) {
      await client.query(
        `
          INSERT INTO collections (name, color, icon, type, user_id)
          VALUES ($1, '#2563eb', '!', 'pin', $2)
        `,
        [E2E_USER.collectionName, userId]
      );
    }
  } finally {
    await client.end();
  }
}
