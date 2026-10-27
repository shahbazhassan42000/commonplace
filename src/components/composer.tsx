"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { postLine, type PostLineState } from "@/app/actions";
import { charLength, LINE_MAX, linePath } from "@/lib/text";
import { CategoryPicker, type CategoryOption } from "./category-picker";

const initialState: PostLineState = { status: "idle" };

export function Composer({
  categories,
  defaultCategory = "",
}: {
  categories: CategoryOption[];
  defaultCategory?: string;
}) {
  const [state, formAction, pending] = useActionState(postLine, initialState);
  // A new key after each successful post remounts the fields, clearing them.
  const fieldsKey = state.status === "success" ? state.line.id : "draft";

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-5 sm:p-6">
      <ComposerFields
        key={fieldsKey}
        categories={categories}
        initialLine={state.status === "error" ? state.values.line : ""}
        initialCategory={
          state.status === "error" ? state.values.category : defaultCategory
        }
        errors={state.status === "error" ? state.errors : {}}
        pending={pending}
      />
      <div aria-live="polite" className="text-sm empty:hidden">
        {state.status === "error" && state.errors.form && (
          <p className="text-danger">{state.errors.form}</p>
        )}
        {state.status === "success" && (
          <p className="text-muted">
            Posted to <strong className="text-ink">{state.line.categoryName}</strong>.{" "}
            <Link href={linePath(state.line)} className="link">
              See your line
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}

function ComposerFields({
  categories,
  initialLine,
  initialCategory,
  errors,
  pending,
}: {
  categories: CategoryOption[];
  initialLine: string;
  initialCategory: string;
  errors: { line?: string; category?: string };
  pending: boolean;
}) {
  const lineId = useId();
  const [line, setLine] = useState(initialLine);
  const [category, setCategory] = useState(initialCategory);
  const remaining = LINE_MAX - charLength(line);

  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor={lineId} className="text-sm font-medium text-ink">
          Your line
        </label>
        <textarea
          id={lineId}
          name="line"
          value={line}
          onChange={(e) => setLine(e.target.value)}
          required
          rows={3}
          placeholder="A sentence worth keeping…"
          aria-invalid={errors.line ? true : undefined}
          className="field font-serif text-xl leading-snug"
        />
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-danger" aria-live="polite">
            {errors.line}
          </span>
          <span className={remaining < 0 ? "text-danger" : "text-muted"}>
            {remaining}
          </span>
        </div>
      </div>

      <CategoryPicker
        options={categories}
        value={category}
        onChange={setCategory}
        error={errors.category}
      />

      {/* Honeypot: hidden from people, irresistible to form-filling bots. */}
      <div aria-hidden="true" className="hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="button" disabled={pending || remaining < 0}>
          {pending ? "Posting…" : "Post line"}
        </button>
      </div>
    </>
  );
}
