import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getLine, type LineItem } from "./queries";
import { getObject, putObject } from "./storage";
import { CARD_VERSION } from "./text";

const [newsreader, newsreaderItalic] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Newsreader-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Newsreader-MediumItalic.ttf")),
]);

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

async function renderCard(line: LineItem) {
  const length = [...line.body].length;
  const fontSize = length > 180 ? 44 : length > 90 ? 54 : 66;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f6f3ec",
          color: "#1d1b17",
          fontFamily: "Newsreader",
        }}
      >
        <div style={{ display: "flex", flex: 1, alignItems: "center", fontSize, lineHeight: 1.25 }}>
          {`“${line.body}”`}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "8px 26px",
              borderRadius: 999,
              border: "2px solid #e2dccf",
              color: "#6b655b",
            }}
          >
            {line.category.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontStyle: "italic",
              fontWeight: 500,
              color: "#9a3f1d",
            }}
          >
            Commonplace
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Newsreader", data: newsreader, weight: 400, style: "normal" },
        { name: "Newsreader", data: newsreaderItalic, weight: 500, style: "italic" },
      ],
    },
  );
  return new Uint8Array(await image.arrayBuffer());
}
