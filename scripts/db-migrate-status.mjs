import { readdir } from "fs/promises";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

const migrationsDir = join(process.cwd(), "db", "migrations");

async function getMigrationFiles() {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for db:migrate:status");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const files = await getMigrationFiles();
    const { rows: tableRows } = await client.query(
      `SELECT to_regclass('public.schema_migrations') AS table_name`
    );

    const migrationTableExists = Boolean(tableRows[0]?.table_name);

    const { rows } = migrationTableExists
      ? await client.query(`SELECT id, applied_at FROM schema_migrations ORDER BY id ASC`)
      : { rows: [] };

    const appliedIds = new Set(rows.map((row) => row.id));

    console.log("Migration status:");
    for (const file of files) {
      const status = appliedIds.has(file) ? "applied" : "pending";
      console.log(`- ${file}: ${status}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
