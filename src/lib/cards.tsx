import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getLine, type LineItem } from "./queries";
import { getObject, putObject } from "./storage";
import { CARD_VERSION } from "./text";

const [itim, jacquesFrancois, logo] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Itim-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/JacquesFrancois-Regular.ttf")),
  readFile(join(process.cwd(), "public/logo.svg")),
]);
const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

export const cardKey = (lineId: string) => `cards/v${CARD_VERSION}/${lineId}.png`;

/**
 * Share cards are rendered once, stored in Neon Object Storage, and served
 * from there afterwards. Returns null when the line doesn't exist.
 */
export async function getCard(lineId: string) {
  const key = cardKey(lineId);
  const stored = await getObject(key);
  if (stored) return { key, png: stored, source: "storage" as const };

  const line = await getLine(lineId);
  if (!line) return null;
  const png = await renderCard(line);
  await putObject(key, png, "image/png");
  return { key, png, source: "generated" as const };
}

/** Trims a body to what fits the card, keeping line breaks and adding an ellipsis. */
function cardBody(body: string) {
  const MAX_LINES = 8;
  const MAX_CHARS = 260;
  let truncated = false;

  let lines = body.split("\n");
  if (lines.length > MAX_LINES) {
    lines = lines.slice(0, MAX_LINES);
    truncated = true;
  }
  let text = lines.join("\n");

  const chars = [...text];
  if (chars.length > MAX_CHARS) {
    text = chars.slice(0, MAX_CHARS).join("").trimEnd();
    truncated = true;
  }
  return truncated ? `${text}…` : text;
}

async function renderCard(line: LineItem) {
  const body = cardBody(line.body);
  const length = [...body].length;
  const fontSize =
    length > 200 ? 30 : length > 140 ? 38 : length > 80 ? 46 : length > 40 ? 54 : 60;

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
          <div
            style={{
              display: "flex",
              whiteSpace: "pre-wrap",
              fontSize,
              lineHeight: 1.3,
              color: "#7a3b3b",
            }}
          >
            {`“${body}”`}
          </div>
          <div style={{ display: "flex", fontFamily: "Jacques Francois", fontSize: 30, color: "#4c5d6e" }}>
            {`-${line.source ?? "Anonymous"}`}
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
              color: "#4c5d6e",
            }}
          >
            {line.category.name}
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
      ],
    },
  );
  return new Uint8Array(await image.arrayBuffer());
}
