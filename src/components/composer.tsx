"use client";

import { type ReactNode, useActionState, useId, useState } from "react";
import { postLine, type PostLineState } from "@/app/actions";
import { charLength, LINE_MAX, SOURCE_MAX } from "@/lib/text";
import { CategoryPicker, type CategoryOption } from "./category-picker";
import { RichEditor } from "./rich-editor";
import { SubmittedDialog } from "./submitted-dialog";

const initialState: PostLineState = { status: "idle" };

/** `buddy` is a decorative friend that stands beside the Submit button. */
export function Composer({ categories, buddy }: { categories: CategoryOption[]; buddy?: ReactNode }) {
  const [state, formAction, pending] = useActionState(postLine, initialState);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  // A new key after each successful post remounts the fields, clearing them.
  const fieldsKey = state.status === "success" ? state.line.id : "draft";
  const submitted =
    state.status === "success" && state.line.id !== dismissedId ? state.line : null;

  return (
    <>
      <form action={formAction} className="flex w-full max-w-[720px] flex-col">
        <ComposerFields
          key={fieldsKey}
          categories={categories}
          values={state.status === "error" ? state.values : undefined}
          errors={state.status === "error" ? state.errors : {}}
        />
        {state.status === "error" && state.errors.form && (
          <p role="alert" className="mt-8 text-center font-hand text-lg text-burgundy">
            {state.errors.form}
          </p>
        )}
        <div className="relative mt-16 self-center">
          <button type="submit" className="btn btn-red min-w-[130px]" disabled={pending}>
            {pending ? "Sending…" : "Submit"}
          </button>
          {buddy && (
            <div className="absolute bottom-0 left-full ml-5" data-busy={pending || undefined}>
              {buddy}
            </div>
          )}
        </div>
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
  const lineNoteId = useId();
  const sourceId = useId();
  const [lineText, setLineText] = useState("");
  const [category, setCategory] = useState(values?.category ?? "");
  const [source, setSource] = useState(values?.source ?? "");
  const remaining = LINE_MAX - charLength(lineText);

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="pl-[22px] font-hand text-[26px]">The Line</span>
        <RichEditor
          name="line"
          initialHTML={values?.line}
          invalid={!!errors.line || remaining < 0}
          ariaDescribedBy={lineNoteId}
          onText={setLineText}
        />
        <p id={lineNoteId} className="min-h-6 pl-[22px] font-hand text-base" aria-live="polite">
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
        <label htmlFor={sourceId} className="pl-[22px] font-hand text-[26px]">
          Source
        </label>
        <input
          id={sourceId}
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          maxLength={SOURCE_MAX}
          autoComplete="off"
          placeholder="Author, Book, Anonymous or “Written by me”"
          aria-invalid={errors.source ? true : undefined}
          className="field h-[54px] max-w-[400px]"
        />
        {errors.source && (
          <p className="pl-[22px] font-hand text-base text-burgundy">{errors.source}</p>
        )}
      </div>

      {/* Honeypot: hidden from people, irresistible to form-filling bots. */}
      <div aria-hidden="true" className="hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}
