// Applies db/migrations/*.sql in filename order, once each.
// Usage: npm run db:migrate  (uses DATABASE_URL_UNPOOLED, falling back to DATABASE_URL)
import { readdir, readFile } from "node:fs/promises";
import { config } from "dotenv";
import pg from "pg";

config({ path: [".env.local", ".env"], quiet: true });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL_UNPOOLED (or DATABASE_URL) first.");
  process.exit(1);
}

const dir = new URL("../db/migrations/", import.meta.url);
const client = new pg.Client({ connectionString });
await client.connect();

try {
  // Serialize concurrent runs (e.g. two deploys at once).
  await client.query("SELECT pg_advisory_lock(hashtext('commonplace:migrate'))");
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

  const { rows } = await client.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((row) => row.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(new URL(file, dir), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`${file} failed: ${error.message}`, { cause: error });
    }
    console.log(`applied ${file}`);
    count++;
  }
  console.log(count ? `${count} migration(s) applied.` : "Database is up to date.");
} finally {
  await client.end();
}
