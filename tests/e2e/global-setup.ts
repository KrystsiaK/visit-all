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

const E2E_COLLECTION_COLOR = "#2563eb";
const E2E_COLLECTION_ICON = "!";
const E2E_PIN_ID = "11111111-1111-4111-8111-111111111111";
const E2E_CONTAINER_ID = "22222222-2222-4222-8222-222222222222";
const E2E_PIN_TITLE = "E2E Shell Pin";

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

    let collectionId = existingCollection.rows[0]?.id ?? null;

    if (!collectionId) {
      const createdCollection = await client.query<{ id: string }>(
        `
          INSERT INTO collections (name, color, icon, type, user_id)
          VALUES ($1, $2, $3, 'pin', $4)
          RETURNING id
        `,
        [E2E_USER.collectionName, E2E_COLLECTION_COLOR, E2E_COLLECTION_ICON, userId]
      );

      collectionId = createdCollection.rows[0].id;
    }

    await client.query(
      `
        INSERT INTO entity_containers (
          id,
          entity_type,
          geometry_kind,
          collection_id,
          status,
          source_payload,
          user_id,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          'pin',
          'point',
          $2,
          'active',
          jsonb_build_object('source', 'playwright', 'seed', 'shell-visual-contract'),
          $3,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET collection_id = EXCLUDED.collection_id,
            status = 'active',
            user_id = EXCLUDED.user_id,
            updated_at = NOW()
      `,
      [E2E_CONTAINER_ID, collectionId, userId]
    );

    await client.query(
      `
        INSERT INTO pins (
          id,
          container_id,
          collection_id,
          name,
          note,
          image_url,
          location,
          user_id,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'Playwright shell contract pin',
          NULL,
          ST_SetSRID(ST_MakePoint(-9.2893, 38.6916), 4326),
          $5,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET container_id = EXCLUDED.container_id,
            collection_id = EXCLUDED.collection_id,
            name = EXCLUDED.name,
            note = EXCLUDED.note,
            image_url = EXCLUDED.image_url,
            location = EXCLUDED.location,
            user_id = EXCLUDED.user_id
      `,
      [E2E_PIN_ID, E2E_CONTAINER_ID, collectionId, E2E_PIN_TITLE, userId]
    );

    await client.query(
      `
        INSERT INTO entity_details (
          entity_container_id,
          user_id,
          title,
          description,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, 'Playwright shell contract pin', NOW(), NOW())
        ON CONFLICT (entity_container_id) DO UPDATE
        SET user_id = EXCLUDED.user_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            updated_at = NOW()
      `,
      [E2E_CONTAINER_ID, userId, E2E_PIN_TITLE]
    );
  } finally {
    await client.end();
  }
}
