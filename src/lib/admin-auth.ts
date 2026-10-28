import "server-only";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { MIN_PASSWORD_LENGTH } from "./admin-shared";
import { requireEnv } from "./env";

const scrypt = promisify(scryptCb);

export const SESSION_COOKIE = "cp_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
export { MIN_PASSWORD_LENGTH };

/** "reset" must set a new password before anything else; "active" is signed in. */
export type SessionStage = "reset" | "active";
export type AdminSession = { adminId: string; stage: SessionStage; exp: number };

// --- Password hashing (scrypt) -------------------------------------------

/** Encodes as `scrypt.<salt>.<derivedKey>`, both base64url. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const dk = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt.${salt.toString("base64url")}.${dk.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null,
): Promise<boolean> {
  if (!stored) return false;
  const [scheme, saltB64, dkB64] = stored.split(".");
  if (scheme !== "scrypt" || !saltB64 || !dkB64) return false;
  const expected = Buffer.from(dkB64, "base64url");
  let dk: Buffer;
  try {
    dk = (await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length)) as Buffer;
  } catch {
    return false;
  }
  return dk.length === expected.length && timingSafeEqual(dk, expected);
}

// --- Signed session cookie (HMAC-SHA256) ---------------------------------

function secret() {
  return requireEnv("ADMIN_SESSION_SECRET");
}

export function signSession(session: AdminSession): string {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const given = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminSession;
    if (typeof session.adminId !== "string") return null;
    if (session.stage !== "reset" && session.stage !== "active") return null;
    if (typeof session.exp !== "number" || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Reads and verifies the current request's admin session, if any. */
export async function readSession(): Promise<AdminSession | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Builds a fresh signed session token for the given admin and stage. */
export function freshSessionToken(adminId: string, stage: SessionStage): string {
  return signSession({
    adminId,
    stage,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  };
}
