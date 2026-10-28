import "server-only";
import { query } from "./db";
import type { LineGeo } from "./request-meta";
import { describeUserAgent } from "./user-agent";

/** A line plus the moderation metadata recorded when it was posted. */
export type AdminLine = {
  id: string;
  body: string; // plain text, shown in the table
  html: string; // sanitized HTML, edited in the rich editor
  source: string | null;
  createdAt: string;
  category: { id: string; name: string };
  ip: string | null;
  userAgent: string | null;
  device: string | null;
  acceptLanguage: string | null;
  referer: string | null;
  geo: LineGeo | null;
};

type AdminLineRow = {
  id: string;
  body: string;
  body_html: string;
  source: string | null;
  created_at: Date;
  category_id: string;
  category_name: string;
  ip: string | null;
  user_agent: string | null;
  accept_language: string | null;
  referer: string | null;
  geo: LineGeo | null;
};

/**
 * Every line, newest first, with its moderation metadata. Not cached: the
 * admin view must always reflect the latest state and never leak into the
 * public (tagged) caches.
 */
export async function getAdminLines(limit = 500): Promise<AdminLine[]> {
  const rows = await query<AdminLineRow>(
    `SELECT l.id, l.body, l.body_html, l.source, l.created_at,
            c.id AS category_id, c.name AS category_name,
            l.ip, l.user_agent, l.accept_language, l.referer, l.geo
     FROM lines l JOIN categories c ON c.id = l.category_id
     ORDER BY l.id DESC
     LIMIT $1`,
    [limit],
  );

  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    html: row.body_html,
    source: row.source,
    createdAt: row.created_at.toISOString(),
    category: { id: row.category_id, name: row.category_name },
    ip: row.ip,
    userAgent: row.user_agent,
    device: describeUserAgent(row.user_agent),
    acceptLanguage: row.accept_language,
    referer: row.referer,
    geo: row.geo,
  }));
}
