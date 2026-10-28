import "server-only";
import sanitizeHtml from "sanitize-html";

// How the editor's HTML is cleaned before it's stored. Everything outside this
// allowlist is dropped (text kept), so no scripts, event handlers, styles
// beyond text-align, or non-http(s)/mailto links can be stored or rendered.
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "del",
  "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "span", "a",
];
const STYLE_TAGS = ["p", "h1", "h2", "h3", "li", "blockquote", "span"];

const BASE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
    ...Object.fromEntries(STYLE_TAGS.map((tag) => [tag, ["style"]])),
  },
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  disallowedTagsMode: "discard",
  transformTags: {
    a: (_tag, attribs) => {
      const href = (attribs.href ?? "").trim();
      const safe = /^(https?:|mailto:)/i.test(href);
      const base = { rel: "nofollow noopener noreferrer ugc", target: "_blank" };
      return { tagName: "a", attribs: safe ? { href, ...base } : base };
    },
  },
};

// Previews live inside a card that is itself a link, so anchors are flattened
// to their text there (no nested <a>, which is invalid HTML).
const PREVIEW_OPTIONS: sanitizeHtml.IOptions = {
  ...BASE_OPTIONS,
  allowedTags: ALLOWED_TAGS.filter((tag) => tag !== "a"),
  transformTags: {},
};

export const PREVIEW_CHARS = 600;
export const BODY_HTML_MAX = 200000;

export type RichFields = { html: string; text: string; preview: string };

export function sanitizeRichHtml(dirty: string): string {
  return sanitizeHtml(dirty, BASE_OPTIONS).trim();
}

/** Plain text from HTML: block edges become newlines, then tags are stripped. */
export function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/<\/(p|h[1-3]|li|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");
  const stripped = sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} });
  const decoded = stripped
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  return decoded
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Truncates sanitized HTML to a visible-character budget, closing open tags. */
export function truncateHtml(html: string, maxChars = PREVIEW_CHARS): string {
  let count = 0;
  let out = "";
  const open: string[] = [];
  const tokens = html.match(/<[^>]+>|[^<]+/g) ?? [];
  for (const token of tokens) {
    if (token[0] === "<") {
      out += token;
      const closing = /^<\/\s*([a-z0-9]+)/i.exec(token);
      const opening = /^<\s*([a-z0-9]+)/i.exec(token);
      const selfClosing = /\/>\s*$/.test(token) || /^<\s*br\b/i.test(token);
      if (closing) {
        const idx = open.lastIndexOf(closing[1].toLowerCase());
        if (idx !== -1) open.splice(idx, 1);
      } else if (opening && !selfClosing) {
        open.push(opening[1].toLowerCase());
      }
      continue;
    }
    // Count entities (&amp; etc.) as a single character.
    for (const unit of token.match(/&[a-z0-9#]+;|[\s\S]/gi) ?? []) {
      if (count >= maxChars) {
        out += "…";
        for (let i = open.length - 1; i >= 0; i -= 1) out += `</${open[i]}>`;
        return out;
      }
      out += unit;
      count += 1;
    }
  }
  return out;
}

/** Editor HTML → the three stored forms (full HTML, plain text, card preview). */
export function deriveRichFields(dirtyHtml: string): RichFields {
  const html = sanitizeRichHtml(dirtyHtml);
  const text = htmlToText(html);
  const preview = sanitizeHtml(truncateHtml(html), PREVIEW_OPTIONS).trim();
  return { html, text, preview };
}
