"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { RichEditor } from "@/components/rich-editor";
import type { AdminLine } from "@/lib/admin-queries";
import type { LineGeo } from "@/lib/request-meta";
import { linePath } from "@/lib/text";
import { deleteLines, editLine, type EditState, logout } from "./actions";

const COLUMN_COUNT = 10;

export function AdminDashboard({ lines }: { lines: AdminLine[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  // Last checkbox clicked, so a shift-click can select the range up to it.
  const anchorId = useRef<string | null>(null);
  const [viewing, setViewing] = useState<AdminLine | null>(null);
  const viewDialog = useRef<HTMLDialogElement>(null);

  // The dialog stays mounted and is opened from the click itself, so React's
  // double-run Effects in development can't close it as it opens.
  function view(line: AdminLine) {
    setViewing(line);
    viewDialog.current?.showModal();
  }

  // Read through the current lines so deleted ids drop out on their own.
  const selectedIds = lines.filter((line) => selected.has(line.id)).map((line) => line.id);
  const allSelected = lines.length > 0 && selectedIds.length === lines.length;

  function toggle(index: number, checked: boolean, extend: boolean) {
    const anchor = extend ? lines.findIndex((line) => line.id === anchorId.current) : -1;
    const range =
      anchor === -1
        ? [lines[index]]
        : lines.slice(Math.min(anchor, index), Math.max(anchor, index) + 1);
    setSelected((prev) => {
      const next = new Set(prev);
      for (const line of range) {
        if (checked) next.add(line.id);
        else next.delete(line.id);
      }
      return next;
    });
    anchorId.current = lines[index].id;
  }

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
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <>
              <p className="font-hand text-base text-slate">
                {selectedIds.length} selected ·{" "}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-burgundy"
                  onClick={() => setSelected(new Set())}
                >
                  clear
                </button>
              </p>
              <DeleteButton
                ids={selectedIds}
                prompt={`Delete ${selectedIds.length} ${
                  selectedIds.length === 1 ? "line" : "lines"
                } permanently?`}
                className="btn btn-red"
              >
                Delete selected
              </DeleteButton>
            </>
          )}
          <form action={logout}>
            <button type="submit" className="btn btn-outline">
              Log out
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-burgundy/40">
        <table className="w-full min-w-[1120px] border-collapse text-left align-top text-sm">
          <thead>
            <tr className="border-b border-burgundy/40 bg-blush/60 font-hand text-slate">
              <Th className="w-0">
                <input
                  type="checkbox"
                  className="size-4 cursor-pointer accent-burgundy align-middle"
                  aria-label="Select all lines"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = selectedIds.length > 0 && !allSelected;
                  }}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked ? new Set(lines.map((line) => line.id)) : new Set(),
                    )
                  }
                  disabled={lines.length === 0}
                />
              </Th>
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
            {lines.map((line, index) =>
              editingId === line.id ? (
                <EditorRow
                  key={line.id}
                  line={line}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => setEditingId(null)}
                />
              ) : (
                <tr
                  key={line.id}
                  className={`border-b border-burgundy/15 hover:bg-blush/40 ${
                    selected.has(line.id) ? "bg-blush/60" : ""
                  }`}
                >
                  <Td>
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer accent-burgundy align-middle"
                      aria-label={`Select “${line.body.slice(0, 60)}”`}
                      checked={selected.has(line.id)}
                      onChange={(event) =>
                        toggle(
                          index,
                          event.target.checked,
                          (event.nativeEvent as MouseEvent).shiftKey,
                        )
                      }
                    />
                  </Td>
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
                        onClick={() => view(line)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="rounded-[8px] border border-burgundy px-3 py-1 text-burgundy transition-colors hover:bg-burgundy/10"
                        onClick={() => setEditingId(line.id)}
                      >
                        Edit
                      </button>
                      <DeleteButton
                        ids={[line.id]}
                        prompt="Delete this line permanently?"
                        className="rounded-[8px] border border-burgundy bg-burgundy px-3 py-1 text-parchment transition-colors hover:bg-burgundy-dark"
                      >
                        Delete
                      </DeleteButton>
                    </div>
                  </Td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <ViewDialog ref={viewDialog} line={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

/** The whole line, rendered as on its public page; the table only shows a clamp. */
function ViewDialog({
  ref,
  line,
  onClose,
}: {
  ref: React.Ref<HTMLDialogElement>;
  line: AdminLine | null;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // The children fill the dialog, so a click on the dialog itself is a
      // click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-labelledby="view-title"
      className="m-auto hidden max-h-[calc(100dvh-32px)] w-[min(795px,calc(100%-32px))] flex-col overflow-hidden rounded-[15px] border border-burgundy bg-parchment p-0 text-ink backdrop:bg-ink/40 open:flex"
    >
      {line && (
        <>
          <header className="flex items-start justify-between gap-4 border-b border-burgundy/40 bg-blush/60 px-6 py-4">
            <div>
              <h2 id="view-title" className="text-xl">
                {line.category.name}
              </h2>
              <p className="font-hand text-base text-slate">{formatWhen(line.createdAt)}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* New tab, so the admin keeps its selection and scroll. */}
              <Link
                href={linePath(line)}
                target="_blank"
                className="font-hand text-base text-slate underline underline-offset-2 hover:text-burgundy"
              >
                Open public page
              </Link>
              <form method="dialog">
                <button className="rounded-[8px] border border-burgundy px-3 py-1 text-burgundy transition-colors hover:bg-burgundy/10">
                  Close
                </button>
              </form>
            </div>
          </header>
          <figure className="flex min-h-0 flex-col items-center gap-4 overflow-y-auto px-6 py-8 text-center">
            <blockquote
              className="rich font-hand text-[26px] leading-snug break-words text-burgundy md:text-[32px]"
              dangerouslySetInnerHTML={{ __html: line.html }}
            />
            <figcaption className="text-lg text-slate">-{line.source ?? "Anonymous"}</figcaption>
          </figure>
        </>
      )}
    </dialog>
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

/** Confirms, then deletes every line in `ids` — one row or a whole selection. */
function DeleteButton({
  ids,
  prompt,
  className,
  children,
}: {
  ids: string[];
  prompt: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={deleteLines}
      onSubmit={(event) => {
        if (!confirm(`${prompt} This can’t be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      {ids.map((id) => (
        <input key={id} type="hidden" name="id" value={id} />
      ))}
      <DeleteSubmit className={className}>{children}</DeleteSubmit>
    </form>
  );
}

function DeleteSubmit({ className, children }: { className: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Deleting…" : children}
    </button>
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
