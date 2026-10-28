"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  freshSessionToken,
  hashPassword,
  MIN_PASSWORD_LENGTH,
  readSession,
  SESSION_COOKIE,
  type SessionStage,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { hashClientIp } from "@/lib/ip-hash";
import { LINES_TAG } from "@/lib/queries";
import { plainToRichFields } from "@/lib/rich-text";
import { CATEGORY_MAX, charLength, LINE_MAX, normalize, parseId, SOURCE_MAX } from "@/lib/text";

// --- Sign in -------------------------------------------------------------

export type LoginState = { status: "idle" } | { status: "error"; email: string; message: string };

type AdminRow = { id: string; password_hash: string | null; must_reset: boolean };

// Per-IP sign-in throttle. scrypt already makes each check costly; this caps
// how many an attacker can make.
const LOGIN_RATE_LIMIT = { attempts: 8, minutes: 15 };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { status: "error", email, message: "Enter your email and password." };
  }

  const ipHash = hashClientIp(await headers());
  if (ipHash && (await tooManyAttempts(ipHash))) {
    return {
      status: "error",
      email,
      message: "Too many attempts. Wait a few minutes and try again.",
    };
  }

  const auth = await authenticate(email, password);
  if (!auth) {
    if (ipHash) {
      await query(`INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)`, [ipHash]);
    }
    return { status: "error", email, message: "Incorrect email or password." };
  }

  if (ipHash) {
    await query(`DELETE FROM admin_login_attempts WHERE ip_hash = $1`, [ipHash]);
  }
  (await cookies()).set(
    SESSION_COOKIE,
    freshSessionToken(auth.adminId, auth.stage),
    sessionCookieOptions(),
  );
  redirect("/admin");
}

async function tooManyAttempts(ipHash: string): Promise<boolean> {
  const [{ recent }] = await query<{ recent: number }>(
    `SELECT count(*)::int AS recent FROM admin_login_attempts
     WHERE ip_hash = $1 AND attempted_at > now() - make_interval(mins => $2)`,
    [ipHash, LOGIN_RATE_LIMIT.minutes],
  );
  return recent >= LOGIN_RATE_LIMIT.attempts;
}

/** Verifies credentials and returns the session to grant, or null on failure. */
async function authenticate(
  email: string,
  password: string,
): Promise<{ adminId: string; stage: SessionStage } | null> {
  const [admin] = await query<AdminRow>(
    `SELECT id, password_hash, must_reset FROM admins WHERE lower(email) = $1`,
    [email],
  );

  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!admin) {
    // First ever sign-in: seed only the configured admin, via the initial
    // password from the environment. Then force a password reset.
    if (!envEmail || !initialPassword || email !== envEmail) return null;
    if (!safeEqual(password, initialPassword)) return null;
    const [created] = await query<{ id: string }>(
      `INSERT INTO admins (email, must_reset) VALUES ($1, true) RETURNING id`,
      [email],
    );
    return { adminId: created.id, stage: "reset" };
  }

  if (admin.must_reset) {
    // Account exists but has no password yet: accept only the initial password.
    if (!initialPassword || !safeEqual(password, initialPassword)) return null;
    return { adminId: admin.id, stage: "reset" };
  }

  if (!(await verifyPassword(password, admin.password_hash))) return null;
  return { adminId: admin.id, stage: "active" };
}

// --- Set a new password (forced on first sign-in) ------------------------

export type SetPasswordState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function setPassword(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const session = await readSession();
  if (!session) redirect("/admin");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (charLength(password) < MIN_PASSWORD_LENGTH) {
    return { status: "error", message: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password !== confirm) {
    return { status: "error", message: "The two passwords don’t match." };
  }

  const hash = await hashPassword(password);
  await query(
    `UPDATE admins SET password_hash = $1, must_reset = false, updated_at = now() WHERE id = $2`,
    [hash, session.adminId],
  );

  (await cookies()).set(
    SESSION_COOKIE,
    freshSessionToken(session.adminId, "active"),
    sessionCookieOptions(),
  );
  redirect("/admin");
}

export async function logout() {
  (await cookies()).set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  redirect("/admin");
}

// --- Moderation ----------------------------------------------------------

type EditFields = { line: string; category: string; source: string };

export type EditState =
  | { status: "idle" }
  | { status: "error"; id: string; values: EditFields; errors: Partial<EditFields> & { form?: string } }
  | { status: "success"; id: string };

export async function editLine(_prev: EditState, formData: FormData): Promise<EditState> {
  const session = await readSession();
  if (session?.stage !== "active") redirect("/admin");

  const id = parseId(formData.get("id"));
  const values: EditFields = {
    line: String(formData.get("line") ?? ""),
    category: String(formData.get("category") ?? ""),
    source: String(formData.get("source") ?? ""),
  };
  if (!id) return { status: "error", id: "", values, errors: { form: "Unknown line." } };

  const { html, text, preview } = plainToRichFields(values.line);
  const category = normalize(values.category).replace(/^#+\s*/, "");
  const source = normalize(values.source);

  const errors: Partial<EditFields> = {};
  if (!text) errors.line = "The line can’t be empty.";
  else if (charLength(text) > LINE_MAX) errors.line = `Keep it to ${LINE_MAX} characters.`;
  if (!category) errors.category = "Pick a category.";
  else if (charLength(category) > CATEGORY_MAX)
    errors.category = `Category names are at most ${CATEGORY_MAX} characters.`;
  if (charLength(source) > SOURCE_MAX) errors.source = `Keep the source to ${SOURCE_MAX} characters.`;
  if (errors.line || errors.category || errors.source) {
    return { status: "error", id, values, errors };
  }

  const updated = await query<{ id: string }>(
    `WITH category AS (
       INSERT INTO categories (name) VALUES ($1)
       ON CONFLICT (lower(name)) DO UPDATE SET name = categories.name
       RETURNING id
     )
     UPDATE lines
     SET body = $2, body_html = $3, body_preview = $4, source = $5,
         category_id = (SELECT id FROM category)
     WHERE id = $6
     RETURNING id`,
    [category, text, html, preview, source || null, id],
  );
  if (updated.length === 0) {
    return { status: "error", id, values, errors: { form: "That line no longer exists." } };
  }

  updateTag(LINES_TAG);
  revalidatePath("/admin");
  return { status: "success", id };
}

export async function deleteLine(formData: FormData): Promise<void> {
  const session = await readSession();
  if (session?.stage !== "active") redirect("/admin");

  const id = parseId(formData.get("id"));
  if (!id) return;
  await query(`DELETE FROM lines WHERE id = $1`, [id]);

  updateTag(LINES_TAG);
  revalidatePath("/admin");
}

/** Constant-time string comparison that doesn't leak length via early return. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
