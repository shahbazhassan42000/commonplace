import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { fitQuote, LINE_HEIGHT } from "./card-fit";
import { getLine, type LineFull } from "./queries";
import { cardParagraphs, hasRtl, isRtl, rtlLine } from "./rtl";
import { getObject, putObject } from "./storage";
import { CARD_VERSION, cardFingerprint } from "./text";

const [itim, jacquesFrancois, notoArabic, logo] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Itim-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/JacquesFrancois-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/NotoSansArabic-Regular.ttf")),
  readFile(join(process.cwd(), "public/logo.svg")),
]);
const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

export const cardKey = (line: LineFull) =>
  `cards/v${CARD_VERSION}/${line.id}-${cardFingerprint(line)}.png`;

/**
 * Share cards are rendered once per version of a line, stored in Neon Object
 * Storage, and served from there afterwards. The key carries a fingerprint of
 * the card's content, so an edit renders a new card. Returns null when the
 * line doesn't exist.
 */
export async function getCard(lineId: string) {
  const line = await getLine(lineId);
  if (!line) return null;
  const key = cardKey(line);
  const stored = await getObject(key);
  if (stored) return { key, png: stored, source: "storage" as const };

  const png = await renderCard(line);
  await putObject(key, png, "image/png");
  return { key, png, source: "generated" as const };
}

const FLUSH_RIGHT = { justifyContent: "flex-end", textAlign: "right" } as const;
// Gap between words laid out as flex items: Noto Sans Arabic's space width.
const WORD_GAP_EM = 0.26;

async function renderCard(line: LineFull) {
  // The whole line when it fits the card (shrinking the font if needed);
  // trimmed with an ellipsis only when it can't fit even at the smallest size.
  const source = `-${line.source ?? "Anonymous"}`;
  const { fontSize, text: body } = fitQuote(line.text, source);
  // Satori can't lay out right-to-left text itself (see ./rtl). Text with any
  // Urdu is set paragraph by paragraph, each word a flex item placed in its
  // paragraph's direction, so the layout wraps lines in the right order. The
  // source and category go through rtlLine, which leaves Latin text unchanged.
  const rtl = isRtl(body);
  const quoteStyle = { display: "flex", fontSize, lineHeight: LINE_HEIGHT, color: "#7a3b3b" } as const;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 80px 56px",
          background: "#f1e7d0",
          fontFamily: "Itim",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
          }}
        >
          {hasRtl(body) ? (
            <div style={{ ...quoteStyle, flexDirection: "column" }}>
              {cardParagraphs(body).map((paragraph, i) =>
                paragraph ? (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      flexDirection: paragraph.dir === "R" ? "row-reverse" : "row",
                      columnGap: Math.round(fontSize * WORD_GAP_EM),
                    }}
                  >
                    {paragraph.units.map((unit, j) => (
                      <div key={j} style={{ display: "flex" }}>
                        {unit}
                      </div>
                    ))}
                  </div>
                ) : (
                  // A blank line between paragraphs.
                  <div key={i} style={{ display: "flex", height: Math.round(fontSize / 2) }} />
                ),
              )}
            </div>
          ) : (
            <div style={{ ...quoteStyle, whiteSpace: "pre-wrap" }}>{`“${body}”`}</div>
          )}
          <div
            style={{
              display: "flex",
              fontFamily: "Jacques Francois",
              fontSize: 30,
              lineHeight: LINE_HEIGHT,
              color: "#4c5d6e",
              ...(rtl ? FLUSH_RIGHT : {}),
            }}
          >
            {rtlLine(source)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "3px solid #7a3b3b",
            paddingTop: 32,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
          <img src={logoSrc} width={271} height={62} alt="" />
          <div
            style={{
              display: "flex",
              padding: "8px 24px",
              border: "2px solid #7a3b3b",
              borderRadius: 20,
              fontFamily: "Jacques Francois",
              fontSize: 26,
              lineHeight: LINE_HEIGHT,
              color: "#4c5d6e",
            }}
          >
            {rtlLine(line.category.name)}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Itim", data: itim, weight: 400, style: "normal" },
        { name: "Jacques Francois", data: jacquesFrancois, weight: 400, style: "normal" },
        // Arabic-script fallback so Urdu lines render instead of failing.
        // Noto Sans Arabic: its GSUB avoids the lookup format Satori can't
        // parse (Noto Naskh's does, which crashed card generation).
        { name: "Noto Sans Arabic", data: notoArabic, weight: 400, style: "normal" },
      ],
    },
  );
  return new Uint8Array(await image.arrayBuffer());
}
