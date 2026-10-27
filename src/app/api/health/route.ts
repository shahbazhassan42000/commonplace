import { connection } from "next/server";
import { query } from "@/lib/db";
import { pingBucket } from "@/lib/storage";

async function check(probe: () => Promise<unknown>) {
  const start = performance.now();
  try {
    await probe();
    return { ok: true, ms: Math.round(performance.now() - start) };
  } catch (error) {
    console.error("Health check failed", error);
    return { ok: false, ms: Math.round(performance.now() - start) };
  }
}

/** Live check of both Neon services. */
export async function GET() {
  // Always run at request time; never prerender a health result at build.
  await connection();
  const [database, storage] = await Promise.all([
    check(() => query("SELECT 1")),
    check(pingBucket),
  ]);
  const ok = database.ok && storage.ok;
  return Response.json(
    { ok, database, storage },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
