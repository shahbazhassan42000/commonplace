"use client";

import { useActionState, useId, useState } from "react";
import { postLine, type PostLineState } from "@/app/actions";
import { charLength, LINE_MAX, SOURCE_MAX } from "@/lib/text";
import { CategoryPicker, type CategoryOption } from "./category-picker";
import { SubmittedDialog } from "./submitted-dialog";

const initialState: PostLineState = { status: "idle" };

export function Composer({ categories }: { categories: CategoryOption[] }) {
  const [state, formAction, pending] = useActionState(postLine, initialState);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  // A new key after each successful post remounts the fields, clearing them.
  const fieldsKey = state.status === "success" ? state.line.id : "draft";
  const submitted =
    state.status === "success" && state.line.id !== dismissedId ? state.line : null;

  return (
    <>
      <form action={formAction} className="flex w-full max-w-[661px] flex-col">
        <ComposerFields
          key={fieldsKey}
          categories={categories}
          values={state.status === "error" ? state.values : undefined}
          errors={state.status === "error" ? state.errors : {}}
        />
        {state.status === "error" && state.errors.form && (
          <p role="alert" className="mt-8 text-center font-hand text-burgundy">
            {state.errors.form}
          </p>
        )}
        <button type="submit" className="btn btn-red mt-20 w-[108px] self-center" disabled={pending}>
          {pending ? "Sending…" : "Submit"}
        </button>
      </form>
      {submitted && (
        <SubmittedDialog line={submitted} onClose={() => setDismissedId(submitted.id)} />
      )}
    </>
  );
}

function ComposerFields({
  categories,
  values,
  errors,
}: {
  categories: CategoryOption[];
  values?: { line: string; category: string; source: string };
  errors: { line?: string; category?: string; source?: string };
}) {
  const lineId = useId();
  const lineNoteId = useId();
  const sourceId = useId();
  const [line, setLine] = useState(values?.line ?? "");
  const [category, setCategory] = useState(values?.category ?? "");
  const [source, setSource] = useState(values?.source ?? "");
  const remaining = LINE_MAX - charLength(line);

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={lineId} className="pl-[22px] font-hand text-2xl">
          The Line
        </label>
        <textarea
          id={lineId}
          name="line"
          value={line}
          onChange={(e) => setLine(e.target.value)}
          required
          placeholder="Type the quote, line, poetry etc"
          aria-describedby={lineNoteId}
          aria-invalid={errors.line || remaining < 0 ? true : undefined}
          className="field min-h-[86px] resize-y"
        />
        <p id={lineNoteId} className="min-h-5 pl-[22px] font-hand text-sm" aria-live="polite">
          {errors.line ? (
            <span className="text-burgundy">{errors.line}</span>
          ) : remaining <= 40 ? (
            <span className={remaining < 0 ? "text-burgundy" : "text-slate"}>
              {remaining} characters left
            </span>
          ) : null}
        </p>
      </div>

      <CategoryPicker
        className="mt-4"
        options={categories}
        value={category}
        onChange={setCategory}
        error={errors.category}
      />

      <div className="mt-[30px] flex flex-col gap-1">
        <label htmlFor={sourceId} className="pl-[22px] font-hand text-2xl">
          Source
        </label>
        <input
          id={sourceId}
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          maxLength={SOURCE_MAX}
          autoComplete="off"
          placeholder="Author, Book, or “Written by me”"
          aria-invalid={errors.source ? true : undefined}
          className="field h-12 max-w-[336px]"
        />
        {errors.source && (
          <p className="pl-[22px] font-hand text-sm text-burgundy">{errors.source}</p>
        )}
      </div>

      {/* Honeypot: hidden from people, irresistible to form-filling bots. */}
      <div aria-hidden="true" className="hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}
