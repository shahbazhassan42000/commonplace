// Satori renders the share cards. It shapes Arabic-script letters, but places
// each line's words left to right in reading order, and its text engine
// (opentype.js) then reverses only certain Arabic characters inside each word.
// So right-to-left text comes out scrambled: words in the wrong order, and
// marks like "۔" on the wrong side. These helpers work out how a line should
// look and give Satori the text that renders that way.

const RTL_CHAR = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
// What opentype.js counts as Arabic (isArabicChar or isTashkeelArabicChar);
// it reverses each run of these within a word.
const ENGINE_ARABIC_RUN =
  /[؀-ٟ٪-ےۖ-ۜ۟-۪ۤۧۨ-ۭۺ-ۿ]+/gu;
const MIRROR: Record<string, string> = {
  "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "«": "»", "»": "«",
};

// Average advance of Urdu text in em, deliberately generous: a line that
// overflows its box would be re-wrapped by Satori and its words would scramble.
const CHAR_EM = 0.72;

type Dir = "L" | "R";
type Kind = Dir | "N";
const isStrong = (kind: Kind): kind is Dir => kind !== "N";

/** Numbers read left to right, even inside Urdu; spaces and marks are neutral. */
function kindOf(char: string): Kind {
  if (/\p{Nd}/u.test(char)) return "L";
  if (RTL_CHAR.test(char)) return "R";
  return /\p{L}/u.test(char) ? "L" : "N";
}

/** True when the text's first letter is right-to-left (Urdu, Arabic, Hebrew). */
export function isRtl(text: string) {
  const first = /\p{L}/u.exec(text)?.[0];
  return first !== undefined && RTL_CHAR.test(first);
}

/**
 * How a line should appear, left to right — a simplified Unicode bidi pass.
 * The line takes its first letter's direction (as in the browser); spaces and
 * marks join the text around them when both sides agree, else follow the line.
 */
function visualOrder(line: string) {
  const chars = [...line];
  const kinds = chars.map(kindOf);
  const base: Dir = isRtl(line) || !/\p{L}/u.test(line) ? "R" : "L";
  const dirs = kinds.map((kind, i): Dir => {
    if (isStrong(kind)) return kind;
    const before = kinds.slice(0, i).findLast(isStrong);
    const after = kinds.slice(i + 1).find(isStrong);
    return before && before === after ? before : base;
  });

  const runs: { dir: Dir; chars: string[] }[] = [];
  chars.forEach((char, i) => {
    const last = runs.at(-1);
    if (last?.dir === dirs[i]) last.chars.push(char);
    else runs.push({ dir: dirs[i], chars: [char] });
  });
  const shown = runs.map(({ dir, chars: run }) =>
    dir === "R" ? run.reverse().map((c) => MIRROR[c] ?? c) : run,
  );
  return (base === "R" ? shown.reverse() : shown).flat().join("");
}

/** One line, rewritten so that Satori renders it in the right visual order. */
export function rtlLine(line: string) {
  if (!RTL_CHAR.test(line)) return line;
  // Pre-reverse what the engine will reverse, so it lands where it belongs.
  return visualOrder(line).replace(ENGINE_ARABIC_RUN, (run) => [...run].reverse().join(""));
}

/** Greedily wraps a paragraph into lines of at most `maxChars` characters. */
function wrap(paragraph: string, maxChars: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of paragraph.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && [...next].length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  return lines;
}

/**
 * Lays out right-to-left card text for a box `width` px wide, starting from
 * `fontSize`. Verse (several lines) keeps each line whole by shrinking the font,
 * down to `minFontSize`; prose wraps. Returns the size and the text, ready for
 * Satori, with lines joined by newlines.
 */
export function rtlBlock(text: string, fontSize: number, width: number, minFontSize: number) {
  const paragraphs = text.split("\n");
  let size = fontSize;
  if (paragraphs.length > 1) {
    const longest = Math.max(...paragraphs.map((p) => [...p].length));
    size = Math.max(minFontSize, Math.min(size, Math.floor(width / (longest * CHAR_EM))));
  }
  const maxChars = Math.floor(width / (size * CHAR_EM));
  const lines = paragraphs.flatMap((p) => wrap(p, maxChars));
  return { fontSize: size, text: lines.map(rtlLine).join("\n") };
}
