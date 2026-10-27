"use server";

import { createHmac } from "node:crypto";
import { ipAddress } from "@vercel/functions";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { query } from "@/lib/db";
import { LINES_TAG } from "@/lib/queries";
import { CATEGORY_MAX, charLength, LINE_MAX, normalize, SOURCE_MAX } from "@/lib/text";

type Fields = { line: string; category: string; source: string };

export type PostLineState =
  | { status: "idle" }
  | {
      status: "error";
      values: Fields;
      errors: Partial<Fields> & { form?: string };
    }
  | {
      status: "success";
      line: { id: string; categoryId: string; categoryName: string };
    };

const RATE_LIMIT = { lines: 5, minutes: 10 };

export async function postLine(
  _prev: PostLineState,
  formData: FormData,
): Promise<PostLineState> {
  const values = {
    line: String(formData.get("line") ?? ""),
    category: String(formData.get("category") ?? ""),
    source: String(formData.get("source") ?? ""),
  };
  const line = normalize(values.line);
  const category = normalize(values.category).replace(/^#+\s*/, "");
  const source = normalize(values.source);

  const errors: Partial<Fields> = {};
  if (!line) errors.line = "Write a line first.";
  else if (charLength(line) > LINE_MAX)
    errors.line = `Keep it to ${LINE_MAX} characters.`;
  if (!category) errors.category = "Pick a category or add a new one.";
  else if (charLength(category) > CATEGORY_MAX)
    errors.category = `Category names are at most ${CATEGORY_MAX} characters.`;
  if (charLength(source) > SOURCE_MAX)
    errors.source = `Keep the source to ${SOURCE_MAX} characters.`;
  if (errors.line || errors.category || errors.source) {
    return { status: "error", values, errors };
  }

  if (formData.get("website")) {
    return { status: "error", values, errors: { form: "Something went wrong." } };
  }

  const authorHash = await hashClientIp();
  if (authorHash) {
    const [{ recent }] = await query<{ recent: number }>(
      `SELECT count(*)::int AS recent FROM lines
       WHERE author_hash = $1 AND created_at > now() - make_interval(mins => $2)`,
      [authorHash, RATE_LIMIT.minutes],
    );
    if (recent >= RATE_LIMIT.lines) {
      return {
        status: "error",
        values,
        errors: { form: "You’re posting quickly. Try again in a few minutes." },
      };
    }
  }

  // Reuse the category whose name matches case-insensitively, or create it.
  // DO UPDATE (a no-op write) makes RETURNING yield the existing row too.
  const [created] = await query<{ id: string; category_id: string; category_name: string }>(
    `WITH category AS (
       INSERT INTO categories (name) VALUES ($1)
       ON CONFLICT (lower(name)) DO UPDATE SET name = categories.name
       RETURNING id, name
     )
     INSERT INTO lines (body, source, category_id, author_hash)
     SELECT $2, $3, category.id, $4 FROM category
     RETURNING id, category_id, (SELECT name FROM category) AS category_name`,
    [category, line, source || null, authorHash],
  );

  updateTag(LINES_TAG);

  return {
    status: "success",
    line: {
      id: created.id,
      categoryId: created.category_id,
      categoryName: created.category_name,
    },
  };
}

/** Keyed hash of the client IP, or null when no salt is configured. */
async function hashClientIp() {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;
  // Reads x-real-ip, which Vercel's edge sets and clients cannot spoof.
  const ip = ipAddress(await headers()) ?? "unknown";
  return createHmac("sha256", salt).update(ip).digest("base64url");
}
