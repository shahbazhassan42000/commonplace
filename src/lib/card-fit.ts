import { hasRtl } from "./rtl";

// Line height for all card text. The source and category set it explicitly
// too: Arabic-script glyphs fall back to Noto Sans Arabic, whose natural line
// is 2.1em tall, and would otherwise make those lines (and the footer) grow.
export const LINE_HEIGHT = 1.3;
const SOURCE_SIZE = 30;
const SOURCE_LINE = SOURCE_SIZE * LINE_HEIGHT;
// The quote's box, from renderCard's layout: the 1200×630 card less its side
// padding, and its height less the padding (64 + 56), footer (3 + 32 + 62),
// gap above the source (28), one source line, and a few px of slack.
const QUOTE_WIDTH = 1200 - 2 * 80;
const QUOTE_HEIGHT = 630 - (64 + 56) - (3 + 32 + 62) - 28 - SOURCE_LINE - 6;
const FONT_SIZES = [60, 54, 46, 38, 30, 26];
// Wrapping at word boundaries leaves the end of each line partly empty.
const WRAP_FILL = 0.9;

/** Rough rendered width in em, on the generous side: Urdu runs narrower than Itim. */
function widthEm(text: string) {
  let em = 0;
  for (const char of text) em += hasRtl(char) ? 0.44 : 0.5;
  return em;
}

/** Estimated lines the text wraps to at a font size; a blank line counts as one. */
function lineCount(text: string, fontSize: number) {
  const perLine = (QUOTE_WIDTH * WRAP_FILL) / fontSize;
  return text
    .split("\n")
    .reduce((lines, paragraph) => lines + Math.max(1, Math.ceil(widthEm(paragraph) / perLine)), 0);
}

/** Keeps whole paragraphs while they fit, then as many words as fit, then "…". */
function trimToLines(text: string, fontSize: number, maxLines: number) {
  const perLine = (QUOTE_WIDTH * WRAP_FILL) / fontSize;
  const kept: string[] = [];
  let used = 0;
  for (const paragraph of text.split("\n")) {
    const lines = lineCount(paragraph, fontSize);
    if (used + lines <= maxLines) {
      kept.push(paragraph);
      used += lines;
      continue;
    }
    const room = (maxLines - used) * perLine - 1; // leave room for the ellipsis
    let cut = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = cut ? `${cut} ${word}` : word;
      if (widthEm(next) > room) break;
      cut = next;
    }
    if (cut) kept.push(cut);
    break;
  }
  return `${kept.join("\n").trimEnd()}…`;
}

/**
 * Sizes a share card's quote: the length-based size cards have always used,
 * smaller if the whole text still wouldn't fit, and trimmed with an ellipsis
 * only when even the smallest size can't hold it. `source` is the attribution
 * line, which takes room from the quote when it wraps.
 */
export function fitQuote(text: string, source: string) {
  const height = QUOTE_HEIGHT - (lineCount(source, SOURCE_SIZE) - 1) * SOURCE_LINE;
  const length = [...text].length;
  const start = length > 200 ? 30 : length > 140 ? 38 : length > 80 ? 46 : length > 40 ? 54 : 60;
  const fits = (size: number) => lineCount(text, size) * size * LINE_HEIGHT <= height;
  const fontSize = FONT_SIZES.find((size) => size <= start && fits(size));
  if (fontSize) return { fontSize, text };

  const smallest = FONT_SIZES[FONT_SIZES.length - 1];
  const maxLines = Math.floor(height / (smallest * LINE_HEIGHT));
  return { fontSize: smallest, text: trimToLines(text, smallest, maxLines) };
}
