import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, type QueryResultRow } from "pg";
import { requireEnv } from "./env";

// One pool per server instance (reused across hot reloads in dev). On Vercel
// Fluid compute, attachDatabasePool releases idle connections before the
// instance is suspended.
const globalForPool = globalThis as typeof globalThis & { pgPool?: Pool };

function createPool() {
  const pool = new Pool({
    connectionString: requireEnv("DATABASE_URL"),
    max: 5,
  });
  // Neon suspends idle computes, which closes idle connections. Without a
  // listener, that error would crash the process.
  pool.on("error", (error) => console.error("Postgres pool error", error));
  attachDatabasePool(pool);
  return pool;
}

export async function query<Row extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<Row[]> {
  globalForPool.pgPool ??= createPool();
  const result = await globalForPool.pgPool.query<Row>(text, params);
  return result.rows;
}
