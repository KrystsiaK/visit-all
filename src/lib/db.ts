import { Pool } from 'pg';

// Creates a single connection pool per Node process
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function checkDatabaseConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  } finally {
    client.release();
  }
}
