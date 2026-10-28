import "server-only";
import { geolocation, ipAddress } from "@vercel/functions";

/** Coarse, IP-derived location from the Vercel proxy (no GPS, no consent prompt). */
export type LineGeo = {
  city?: string;
  countryRegion?: string;
  country?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
};

export type RequestMeta = {
  ip: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  referer: string | null;
  geo: LineGeo | null;
};

/** Minimal header shape — satisfied by both `Headers` and Next's ReadonlyHeaders. */
export type RequestHeaders = { get(name: string): string | null };

/**
 * Request metadata attached to a submission for admin moderation. Everything
 * here is sent by the client's browser or derived by Vercel's proxy from the
 * connection — nothing is asked of the poster. Shown only on /admin.
 */
export function requestMeta(headers: RequestHeaders): RequestMeta {
  const g = geolocation({ headers });
  const geo: LineGeo = {
    city: g.city,
    countryRegion: g.countryRegion,
    country: g.country,
    postalCode: g.postalCode,
    latitude: g.latitude,
    longitude: g.longitude,
    timezone: headers.get("x-vercel-ip-timezone") ?? undefined,
  };
  const hasGeo = Object.values(geo).some((value) => value != null && value !== "");

  return {
    ip: ipAddress(headers) ?? null,
    userAgent: headers.get("user-agent"),
    acceptLanguage: headers.get("accept-language"),
    referer: headers.get("referer"),
    geo: hasGeo ? geo : null,
  };
}
