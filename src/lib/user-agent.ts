/**
 * Best-effort, dependency-free summary of a user-agent string, e.g.
 * "Chrome on Windows" or "Safari on iPhone". Returns null for an empty UA.
 * The raw string is kept alongside this for cases the heuristics miss.
 */
export function describeUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;

  const os =
    /Windows NT 10/.test(ua) ? "Windows" :
    /Windows/.test(ua) ? "Windows" :
    /iPhone/.test(ua) ? "iPhone" :
    /iPad/.test(ua) ? "iPad" :
    /Android/.test(ua) ? "Android" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Linux/.test(ua) ? "Linux" :
    null;

  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    null;

  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? "Unknown device";
}
