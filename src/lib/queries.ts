import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "./db";

/** Every cached read below is invalidated with this tag when a line is posted. */
export const LINES_TAG = "lines";

const PAGE_SIZE = 20;

export type CategorySummary = { id: string; name: string; lineCount: number };

export type LineItem = {
  id: string;
  body: string;
  source: string | null;
  createdAt: string;
  category: { id: string; name: string };
};

export type LinePage = { lines: LineItem[]; nextCursor: string | null };

type CategoryRow = { id: string; name: string; line_count: number };

type LineRow = {
  id: string;
  body: string;
  source: string | null;
  created_at: Date;
  category_id: string;
  category_name: string;
};

const toCategory = (row: CategoryRow): CategorySummary => ({
  id: row.id,
  name: row.name,
  lineCount: row.line_count,
});

const toLine = (row: LineRow): LineItem => ({
  id: row.id,
  body: row.body,
  source: row.source,
  createdAt: row.created_at.toISOString(),
  category: { id: row.category_id, name: row.category_name },
});

function toPage(rows: LineRow[]): LinePage {
  const lines = rows.slice(0, PAGE_SIZE).map(toLine);
  return {
    lines,
    nextCursor: rows.length > PAGE_SIZE ? lines[lines.length - 1].id : null,
  };
}

const LINE_COLUMNS = `
  l.id, l.body, l.source, l.created_at, c.id AS category_id, c.name AS category_name
  FROM lines l JOIN categories c ON c.id = l.category_id`;

// Grids and the hero only show a short, line-clamped preview, so list reads
// fetch just a prefix of the body instead of the full text (bodies can be up
// to 30,000 chars). The cap is well beyond what the clamp ever renders, so the
// cut is never visible — it only keeps the payload small. The single line page
// and the share card use LINE_COLUMNS to get the full body.
const PREVIEW_BODY_CHARS = 1200;
const LINE_LIST_COLUMNS = `
  l.id, left(l.body, ${PREVIEW_BODY_CHARS}) AS body, l.source, l.created_at,
  c.id AS category_id, c.name AS category_name
  FROM lines l JOIN categories c ON c.id = l.category_id`;

/** Categories ranked by how many lines they hold. */
export async function getPopularCategories(limit: number) {
  "use cache: remote";
  cacheTag(LINES_TAG);
  cacheLife("hours");
  const rows = await query<CategoryRow>(
    `SELECT c.id, c.name, count(*)::int AS line_count
     FROM lines l JOIN categories c ON c.id = l.category_id
     GROUP BY c.id
     ORDER BY line_count DESC, max(l.id) DESC
     LIMIT $1`,
    [limit],
  );
  return rows.map(toCategory);
}

export async function getCategory(id: string) {
  "use cache: remote";
  cacheTag(LINES_TAG);
  cacheLife("hours");
  const [row] = await query<CategoryRow>(
    `SELECT c.id, c.name, count(l.id)::int AS line_count
     FROM categories c LEFT JOIN lines l ON l.category_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id],
  );
  return row ? toCategory(row) : null;
}

/** Newest first, optionally within one category; pass nextCursor to continue. */
export async function getLines(categoryId: string | null, before: string | null) {
  "use cache: remote";
  cacheTag(LINES_TAG);
  cacheLife("hours");
  const rows = await query<LineRow>(
    `SELECT ${LINE_LIST_COLUMNS}
     WHERE ($1::bigint IS NULL OR l.category_id = $1)
       AND ($2::bigint IS NULL OR l.id < $2)
     ORDER BY l.id DESC
     LIMIT $3`,
    [categoryId, before, PAGE_SIZE + 1],
  );
  return toPage(rows);
}

/**
 * Lines whose text or source contains `q`, case-insensitively. Not cached:
 * search terms are arbitrary, so entries would rarely be reused.
 */
export async function searchLines(q: string, categoryId: string | null, before: string | null) {
  const pattern = `%${q.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
  const rows = await query<LineRow>(
    `SELECT ${LINE_LIST_COLUMNS}
     WHERE (l.body ILIKE $1 OR l.source ILIKE $1)
       AND ($2::bigint IS NULL OR l.category_id = $2)
       AND ($3::bigint IS NULL OR l.id < $3)
     ORDER BY l.id DESC
     LIMIT $4`,
    [pattern, categoryId, before, PAGE_SIZE + 1],
  );
  return toPage(rows);
}

/**
 * A different line each day. Lines posted before today win, so the pick stays
 * put while new lines arrive during the day.
 */
export async function getLineOfTheDay() {
  "use cache: remote";
  cacheTag(LINES_TAG);
  cacheLife("hours");
  const [row] = await query<LineRow>(
    `SELECT ${LINE_LIST_COLUMNS}
     ORDER BY l.created_at < current_date DESC, md5(l.id::text || current_date::text)
     LIMIT 1`,
  );
  return row ? toLine(row) : null;
}

export async function getLine(id: string) {
  "use cache: remote";
  cacheTag(LINES_TAG);
  cacheLife("days");
  const [row] = await query<LineRow>(`SELECT ${LINE_COLUMNS} WHERE l.id = $1`, [id]);
  return row ? toLine(row) : null;
}
