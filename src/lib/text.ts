export const LINE_MAX = 280;
export const CATEGORY_MAX = 32;

/** Trims and collapses runs of whitespace (including newlines) to one space. */
export function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/** Length in code points, matching Postgres char_length(). */
export function charLength(text: string) {
  return [...text].length;
}

export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** /c/12-poetry — the id is authoritative, the slug is for humans. */
export function categoryPath(category: { id: string; name: string }) {
  const slug = slugify(category.name);
  return slug ? `/c/${category.id}-${slug}` : `/c/${category.id}`;
}

export function linePath(line: { id: string }) {
  return `/l/${line.id}`;
}

/** Bump to regenerate every share card (and bust CDN caches) after a redesign. */
export const CARD_VERSION = 1;

export function cardPath(line: { id: string }) {
  return `/l/${line.id}/card?v=${CARD_VERSION}`;
}

/** Accepts ids and ?before= cursors; anything else is null. */
export function parseId(value: unknown) {
  return typeof value === "string" && /^\d{1,18}$/.test(value) ? value : null;
}

/** Parses the leading id out of a "12-poetry" route segment. */
export function parseIdSegment(segment: string) {
  const match = /^(\d{1,18})(?:-|$)/.exec(segment);
  return match ? match[1] : null;
}
