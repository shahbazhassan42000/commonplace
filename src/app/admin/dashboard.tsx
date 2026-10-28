"use client";

import { useActionState, useEffect, useState } from "react";
import { RichEditor } from "@/components/rich-editor";
import type { AdminLine } from "@/lib/admin-queries";
import type { LineGeo } from "@/lib/request-meta";
import { deleteLine, editLine, type EditState, logout } from "./actions";

const COLUMN_COUNT = 9;

export function AdminDashboard({ lines }: { lines: AdminLine[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-[21px] pb-24 md:px-[41px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px]">Admin</h1>
          <p className="font-hand text-base text-slate">
            {lines.length} {lines.length === 1 ? "line" : "lines"} · metadata is recorded for
            moderation and shown only here
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn btn-outline">
            Log out
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-burgundy/40">
        <table className="w-full min-w-[1120px] border-collapse text-left align-top text-sm">
          <thead>
            <tr className="border-b border-burgundy/40 bg-blush/60 font-hand text-slate">
              <Th>Posted</Th>
              <Th>Category</Th>
              <Th>Line</Th>
              <Th>Source</Th>
              <Th>IP</Th>
              <Th>Location</Th>
              <Th>Device</Th>
              <Th>Language</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td colSpan={COLUMN_COUNT} className="p-6 text-center font-hand text-slate">
                  No lines yet.
                </td>
              </tr>
            )}
            {lines.map((line) =>
              editingId === line.id ? (
                <EditorRow
                  key={line.id}
                  line={line}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => setEditingId(null)}
                />
              ) : (
                <tr key={line.id} className="border-b border-burgundy/15 hover:bg-blush/40">
                  <Td className="whitespace-nowrap text-slate">{formatWhen(line.createdAt)}</Td>
                  <Td className="whitespace-nowrap">{line.category.name}</Td>
                  <Td>
                    <div
                      className="max-w-[320px] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
                      title={line.body}
                    >
                      {line.body}
                    </div>
                  </Td>
                  <Td className="max-w-[160px] truncate text-slate">{line.source ?? "—"}</Td>
                  <Td className="whitespace-nowrap font-mono text-xs">{line.ip ?? "—"}</Td>
                  <Td className="whitespace-nowrap" title={geoDetail(line.geo)}>
                    {formatGeo(line.geo)}
                  </Td>
                  <Td className="max-w-[180px] truncate" title={line.userAgent ?? undefined}>
                    {line.device ?? "—"}
                  </Td>
                  <Td className="whitespace-nowrap text-slate">{primaryLanguage(line.acceptLanguage)}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-[8px] border border-burgundy px-3 py-1 text-burgundy transition-colors hover:bg-burgundy/10"
                        onClick={() => setEditingId(line.id)}
                      >
                        Edit
                      </button>
                      <DeleteButton id={line.id} />
                    </div>
                  </Td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-normal ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-3 py-2 ${className}`} title={title}>
      {children}
    </td>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteLine}
      onSubmit={(event) => {
        if (!confirm("Delete this line permanently? This can’t be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-[8px] border border-burgundy bg-burgundy px-3 py-1 text-parchment transition-colors hover:bg-burgundy-dark"
      >
        Delete
      </button>
    </form>
  );
}

const editInitial: EditState = { status: "idle" };

function EditorRow({
  line,
  onCancel,
  onSaved,
}: {
  line: AdminLine;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(editLine, editInitial);
  const errors = state.status === "error" ? state.errors : {};

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  return (
    <tr className="border-b border-burgundy/30 bg-blush/30">
      <td colSpan={COLUMN_COUNT} className="px-3 py-4">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={line.id} />
          <div className="flex flex-col gap-1">
            <span className="font-hand text-base text-slate">Line</span>
            <RichEditor name="line" initialHTML={line.html} invalid={!!errors.line} />
            {errors.line && <p className="font-hand text-sm text-burgundy">{errors.line}</p>}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <label className="font-hand text-base text-slate">Category</label>
              <input
                name="category"
                defaultValue={line.category.name}
                required
                className="field h-[48px]"
                aria-invalid={errors.category ? true : undefined}
              />
              {errors.category && (
                <p className="font-hand text-sm text-burgundy">{errors.category}</p>
              )}
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <label className="font-hand text-base text-slate">Source</label>
              <input
                name="source"
                defaultValue={line.source ?? ""}
                className="field h-[48px]"
                aria-invalid={errors.source ? true : undefined}
              />
              {errors.source && <p className="font-hand text-sm text-burgundy">{errors.source}</p>}
            </div>
          </div>
          {errors.form && <p className="font-hand text-sm text-burgundy">{errors.form}</p>}
          <div className="flex gap-3">
            <button type="submit" className="btn btn-red" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn-outline" onClick={onCancel} disabled={pending}>
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

// --- Formatting helpers --------------------------------------------------

/** Deterministic UTC stamp so server and client markup match. */
function formatWhen(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())} UTC`;
}

function formatGeo(geo: LineGeo | null): string {
  if (!geo) return "—";
  const parts = [geo.city, geo.countryRegion, geo.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function geoDetail(geo: LineGeo | null): string | undefined {
  if (!geo) return undefined;
  const bits: string[] = [];
  if (geo.postalCode) bits.push(`Postal ${geo.postalCode}`);
  if (geo.latitude && geo.longitude) bits.push(`${geo.latitude}, ${geo.longitude}`);
  if (geo.timezone) bits.push(geo.timezone);
  return bits.length ? bits.join(" · ") : undefined;
}

function primaryLanguage(accept: string | null): string {
  if (!accept) return "—";
  return accept.split(",")[0]?.trim() || "—";
}
