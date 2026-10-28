"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { query } from "@/lib/db";
import { hashClientIp } from "@/lib/ip-hash";
import { LINES_TAG } from "@/lib/queries";
import { requestMeta } from "@/lib/request-meta";
import { BODY_HTML_MAX, deriveRichFields } from "@/lib/rich-text";
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
  const { html, text, preview } = deriveRichFields(values.line);
  const category = normalize(values.category).replace(/^#+\s*/, "");
  const source = normalize(values.source);

  const errors: Partial<Fields> = {};
  if (!text) errors.line = "Write a line first.";
  else if (charLength(text) > LINE_MAX)
    errors.line = `Keep it to ${LINE_MAX} characters.`;
  else if (html.length > BODY_HTML_MAX) errors.line = "That line is too long.";
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

  const requestHeaders = await headers();
  const authorHash = hashClientIp(requestHeaders);
  const meta = requestMeta(requestHeaders);
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
     INSERT INTO lines
       (body, body_html, body_preview, source, category_id,
        author_hash, ip, user_agent, accept_language, referer, geo)
     SELECT $2, $3, $4, $5, category.id, $6, $7, $8, $9, $10, $11::jsonb FROM category
     RETURNING id, category_id, (SELECT name FROM category) AS category_name`,
    [
      category,
      text,
      html,
      preview,
      source || null,
      authorHash,
      meta.ip,
      meta.userAgent,
      meta.acceptLanguage,
      meta.referer,
      meta.geo ? JSON.stringify(meta.geo) : null,
    ],
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
