import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "./db";

/** Every cached read below is invalidated with this tag when a line changes. */
export const LINES_TAG = "lines";

const PAGE_SIZE = 20;

export type CategorySummary = { id: string; name: string; lineCount: number };

/** A line as shown in the grid: a formatted HTML excerpt plus attribution. */
export type LineCard = {
  id: string;
  preview: string; // sanitized HTML excerpt (no links — the card is itself a link)
  source: string | null;
};

/** A line on its own page: full HTML, plus the plain text used elsewhere. */
export type LineFull = {
  id: string;
  html: string; // full sanitized HTML
  text: string; // plain text (share card, metadata, alt text)
  source: string | null;
  createdAt: string;
  category: { id: string; name: string };
};

export type LinePage = { lines: LineCard[]; nextCursor: string | null };

type CategoryRow = { id: string; name: string; line_count: number };
type CardRow = { id: string; preview: string; source: string | null };
type FullRow = {
  id: string;
  html: string;
  text: string;
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

const toCard = (row: CardRow): LineCard => ({
  id: row.id,
  preview: row.preview,
  source: row.source,
});

const toFull = (row: FullRow): LineFull => ({
  id: row.id,
  html: row.html,
  text: row.text,
  source: row.source,
  createdAt: row.created_at.toISOString(),
  category: { id: row.category_id, name: row.category_name },
});

function toPage(rows: CardRow[]): LinePage {
  const lines = rows.slice(0, PAGE_SIZE).map(toCard);
  return {
    lines,
    nextCursor: rows.length > PAGE_SIZE ? lines[lines.length - 1].id : null,
  };
}

// Grid reads fetch only the stored HTML preview — small and already formatted.
const CARD_COLUMNS = `l.id, l.body_preview AS preview, l.source FROM lines l`;

// The line page needs the full HTML and the plain text, plus its category.
const FULL_COLUMNS = `
  l.id, l.body_html AS html, l.body AS text, l.source, l.created_at,
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
  const rows = await query<CardRow>(
    `SELECT ${CARD_COLUMNS}
     WHERE ($1::bigint IS NULL OR l.category_id = $1)
       AND ($2::bigint IS NULL OR l.id < $2)
     ORDER BY l.id DESC
     LIMIT $3`,
    [categoryId, before, PAGE_SIZE + 1],
  );
  return toPage(rows);
}

/**
 * Lines whose plain text or source contains `q`, case-insensitively. Not
 * cached: search terms are arbitrary, so entries would rarely be reused.
 */
export async function searchLines(q: string, categoryId: string | null, before: string | null) {
  const pattern = `%${q.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
  const rows = await query<CardRow>(
    `SELECT ${CARD_COLUMNS}
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
  const [row] = await query<CardRow>(
    `SELECT ${CARD_COLUMNS}
     ORDER BY l.created_at < current_date DESC, md5(l.id::text || current_date::text)
     LIMIT 1`,
  );
  return row ? toCard(row) : null;
}

export async function getLine(id: string) {
  "use cache: remote";
  cacheTag(LINES_TAG);
  cacheLife("days");
  const [row] = await query<FullRow>(`SELECT ${FULL_COLUMNS} WHERE l.id = $1`, [id]);
  return row ? toFull(row) : null;
}
