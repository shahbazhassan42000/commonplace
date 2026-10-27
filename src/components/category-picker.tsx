"use client";

import { useId } from "react";
import { CATEGORY_MAX, normalize } from "@/lib/text";

export type CategoryOption = { id: string; name: string };

const MAX_SUGGESTIONS = 10;

/**
 * One text field holds the line's single category. Existing categories are
 * offered as one-tap choices; typing a name that doesn't exist creates it.
 * Matching is case-insensitive here and, authoritatively, in the database.
 */
export function CategoryPicker({
  options,
  value,
  onChange,
  error,
  className = "",
}: {
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}) {
  const inputId = useId();
  const hintId = useId();
  const query = normalize(value).toLowerCase();
  const exact = options.find((o) => o.name.toLowerCase() === query);
  const suggestions = (
    query ? options.filter((o) => o.name.toLowerCase().includes(query)) : options
  ).slice(0, MAX_SUGGESTIONS);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="pl-[22px] font-hand text-2xl">
        Category
      </label>
      <input
        id={inputId}
        name="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={CATEGORY_MAX}
        required
        autoComplete="off"
        placeholder="Love, Motivational, Hope, Sad, others"
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
        className="field h-12 max-w-[476px]"
      />
      <p id={hintId} className="pl-[22px] font-hand text-sm text-slate" aria-live="polite">
        {error ? (
          <span className="text-burgundy">{error}</span>
        ) : exact ? (
          <>Filed under {exact.name}.</>
        ) : query ? (
          <>“{normalize(value)}” will be added as a new category.</>
        ) : (
          "Pick one below or type your own. One category per line."
        )}
      </p>
      {suggestions.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-2 pl-[22px]" aria-label="Existing categories">
          {suggestions.map((option) => {
            const selected = option === exact;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={selected}
                  onClick={() => onChange(selected ? "" : option.name)}
                >
                  {option.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
