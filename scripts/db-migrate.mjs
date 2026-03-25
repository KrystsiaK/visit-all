import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import pg from "pg";

const { Client } = pg;

const migrationsDir = join(process.cwd(), "db", "migrations");

function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getMigrationFiles() {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for db:migrate");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    await ensureMigrationsTable(client);
    const files = await getMigrationFiles();

    for (const file of files) {
      const id = file;
      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, "utf8");
      const fileChecksum = checksum(sql);

      const { rows } = await client.query(
        `SELECT id, checksum FROM schema_migrations WHERE id = $1 LIMIT 1`,
        [id]
      );

      if (rows[0]) {
        if (rows[0].checksum !== fileChecksum) {
          throw new Error(`Migration checksum mismatch for ${id}. Create a new migration instead of editing an applied one.`);
        }
        continue;
      }

      console.log(`Applying migration: ${id}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2)`,
          [id, fileChecksum]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Migrations complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
