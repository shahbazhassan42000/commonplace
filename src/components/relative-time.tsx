"use client";

import { useSyncExternalStore } from "react";

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relative(date: Date) {
  const seconds = (date.getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

const subscribe = () => () => {};

/**
 * Renders a stable absolute date on the server (pages are cached), then
 * switches to "5 minutes ago" once hydrated.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const date = new Date(iso);
  const label = useSyncExternalStore(
    subscribe,
    () => relative(date),
    () => dateFormat.format(date),
  );
  return (
    <time dateTime={iso} title={dateFormat.format(date)}>
      {label}
    </time>
  );
}
