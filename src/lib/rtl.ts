import { ARABIC_FORMS, LAM_ALEF } from "./arabic-forms";

// Satori renders the share cards, and it can't lay out right-to-left text:
// it places words left to right, measures text one character at a time (so
// joined Arabic letters measure wrong and words collide or drift apart), and
// its text engine reverses only some Arabic characters inside each word.
// These helpers prepare Urdu (and other RTL) text so Satori just draws it:
// letters are joined into Arabic presentation forms (single glyphs that need
// no shaping and measure exactly), and each line is put in visual order.

const RTL_CHAR = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LTR_CHAR = /[\p{L}\p{N}]/u;
// What opentype.js treats as Arabic (isArabicChar or isTashkeelArabicChar):
// it reverses each run of these within a word. Presentation forms aren't in
// it; this only catches what's left unshaped, like "،" and "؟".
const ENGINE_ARABIC_RUN =
  /[؀-ٟ٪-ےۖ-ۜ۟-۪ۤۧۨ-ۭۺ-ۿ]+/gu;
// Marks (harakat) sit on a letter without changing how letters join.
const TRANSPARENT = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/;
// Tatweel and the zero-width joiner join on both sides.
const JOIN_CAUSING = /[ـ‍]/;
const LAM = 0x0644;
const MIRROR: Record<string, string> = {
  "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "«": "»", "»": "«",
};

type Dir = "L" | "R";
type Kind = Dir | "N";
const isStrong = (kind: Kind): kind is Dir => kind !== "N";

/** True when the text contains any right-to-left (Urdu, Arabic, Hebrew) letters. */
export function hasRtl(text: string) {
  return RTL_CHAR.test(text);
}

/** True when the text's first letter is right-to-left. */
export function isRtl(text: string) {
  const first = /\p{L}/u.exec(text)?.[0];
  return first !== undefined && RTL_CHAR.test(first);
}

/** Joins Arabic-script letters into presentation forms, in logical order. */
function shape(text: string) {
  const chars = Array.from(text);
  const codes = chars.map((c) => c.codePointAt(0) ?? 0);
  // A letter connects to the one before it through its final or medial form,
  // and to the one after it through its initial or medial form.
  const joinsBack = (i: number) => JOIN_CAUSING.test(chars[i]) || !!ARABIC_FORMS[codes[i]]?.[1];
  const joinsOn = (i: number) => JOIN_CAUSING.test(chars[i]) || !!ARABIC_FORMS[codes[i]]?.[2];
  const neighbour = (i: number, step: 1 | -1) => {
    for (let j = i + step; j >= 0 && j < chars.length; j += step) {
      if (!TRANSPARENT.test(chars[j])) return j;
    }
    return -1;
  };

  let out = "";
  for (let i = 0; i < chars.length; i += 1) {
    const forms = ARABIC_FORMS[codes[i]];
    if (!forms) {
      out += chars[i];
      continue;
    }
    const prev = neighbour(i, -1);
    const next = neighbour(i, 1);
    const back = prev >= 0 && joinsOn(prev) && !!forms[1];
    const ligature = codes[i] === LAM && next >= 0 ? LAM_ALEF[codes[next]] : undefined;
    if (ligature) {
      // Lam + alef is always written as one ligature; marks between them stay.
      out += String.fromCodePoint(ligature[back ? 1 : 0]) + chars.slice(i + 1, next).join("");
      i = next;
      continue;
    }
    const on = next >= 0 && joinsBack(next) && !!forms[2];
    const form = forms[back ? (on ? 3 : 1) : on ? 2 : 0] || forms[0];
    out += form ? String.fromCodePoint(form) : chars[i];
  }
  return out;
}

/** Numbers read left to right, even inside Urdu; spaces and marks are neutral. */
function kindOf(char: string): Kind {
  if (/\p{Nd}/u.test(char)) return "L";
  if (RTL_CHAR.test(char)) return "R";
  return /\p{L}/u.test(char) ? "L" : "N";
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

/** One line of text, ready for Satori to draw left to right as is. */
export function rtlLine(line: string) {
  if (!hasRtl(line)) return line;
  // The engine reverses what's left of plain Arabic; pre-reverse it to match.
  return visualOrder(shape(line)).replace(ENGINE_ARABIC_RUN, (run) =>
    [...run].reverse().join(""),
  );
}

export type CardParagraph = { dir: Dir; units: string[] };

/**
 * Splits card text into paragraphs for a wrapping flex layout. A paragraph's
 * direction is its first letter's; its words become units to place in that
 * direction (row-reverse for right to left), so the layout wraps lines itself
 * and the first words fill the first line. A run of words in the other
 * direction (an English name in Urdu) stays one unit, in its own order.
 * Blank lines come back as null.
 */
export function cardParagraphs(text: string): (CardParagraph | null)[] {
  return text.split("\n").map((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;
    const dir: Dir = isRtl(paragraph) ? "R" : "L";
    const kinds = words.map((w): Kind => (RTL_CHAR.test(w) ? "R" : LTR_CHAR.test(w) ? "L" : "N"));
    const dirs = kinds.map((kind, i): Dir => {
      if (isStrong(kind)) return kind;
      const before = kinds.slice(0, i).findLast(isStrong);
      const after = kinds.slice(i + 1).find(isStrong);
      return before && before === after ? before : dir;
    });
    const units: string[] = [];
    dirs.forEach((d, i) => {
      if (d !== dir && i > 0 && dirs[i - 1] === d) units[units.length - 1] += ` ${words[i]}`;
      else units.push(words[i]);
    });
    return { dir, units: units.map(rtlLine) };
  });
}
