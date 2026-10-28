import "server-only";
import { createHmac } from "node:crypto";
import { ipAddress } from "@vercel/functions";
import type { RequestHeaders } from "./request-meta";

/**
 * Keyed hash of the client IP, or null when no salt is configured. Used for
 * rate limiting (posting and admin sign-in) without storing raw IPs for it.
 */
export function hashClientIp(reqHeaders: RequestHeaders): string | null {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;
  // Reads x-real-ip, which Vercel's edge sets and clients cannot spoof.
  const ip = ipAddress(reqHeaders) ?? "unknown";
  return createHmac("sha256", salt).update(ip).digest("base64url");
}
