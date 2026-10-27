"use client";

import { useState } from "react";

export function ShareButton({ path, text }: { path: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (typeof navigator.share === "function") {
      // Rejects when the person dismisses the share sheet; nothing to do then.
      await navigator.share({ url, text }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share} className="btn btn-outline" aria-live="polite">
      {copied ? "Link copied" : "Share link"}
    </button>
  );
}
