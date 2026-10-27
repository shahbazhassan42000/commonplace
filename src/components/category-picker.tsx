"use client";

import { useId } from "react";
import { CATEGORY_MAX, normalize } from "@/lib/text";

export type CategoryOption = { id: string; name: string };

const MAX_SUGGESTIONS = 10;

/**
 * One text field holds the post's single category. Existing categories are
 * offered as one-tap choices; typing a name that doesn't exist creates it.
 * Matching is case-insensitive here and, authoritatively, in the database.
 */
export function CategoryPicker({
  options,
  value,
  onChange,
  error,
}: {
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const inputId = useId();
  const hintId = useId();
  const query = normalize(value).toLowerCase();
  const exact = options.find((o) => o.name.toLowerCase() === query);
  const suggestions = (
    query ? options.filter((o) => o.name.toLowerCase().includes(query)) : options
  ).slice(0, MAX_SUGGESTIONS);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
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
        placeholder="Pick one below or type a new one"
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
        className="field"
      />
      <p id={hintId} className="text-sm text-muted" aria-live="polite">
        {error ? (
          <span className="text-danger">{error}</span>
        ) : exact ? (
          <>Posting to <strong className="text-ink">{exact.name}</strong>.</>
        ) : query ? (
          <>“{normalize(value)}” will be added as a new category.</>
        ) : (
          "One category per line."
        )}
      </p>
      {suggestions.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Existing categories">
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
