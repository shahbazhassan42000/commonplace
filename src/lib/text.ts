export const LINE_MAX = 280;
export const CATEGORY_MAX = 32;
export const SOURCE_MAX = 100;

/** Trims and collapses runs of whitespace (including newlines) to one space. */
export function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/** Length in code points, matching Postgres char_length(). */
export function charLength(text: string) {
  return [...text].length;
}

export function linePath(line: { id: string }) {
  return `/l/${line.id}`;
}

/** /browse, optionally filtered by category and/or a search query. */
export function browsePath({
  category,
  q,
  before,
}: { category?: string | null; q?: string | null; before?: string | null } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (before) params.set("before", before);
  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}

/** Bump to regenerate every share card (and bust CDN caches) after a redesign. */
export const CARD_VERSION = 2;

export function cardPath(line: { id: string }) {
  return `/l/${line.id}/card?v=${CARD_VERSION}`;
}

/** Accepts ids and ?before= cursors; anything else is null. */
export function parseId(value: unknown) {
  return typeof value === "string" && /^\d{1,18}$/.test(value) ? value : null;
}
