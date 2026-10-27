"use client";

import { useState } from "react";
import type { CategorySummary, LineItem } from "@/lib/queries";
import { LineGrid } from "./line-grid";

export type CategoryGroup = { category: CategorySummary; lines: LineItem[] };

/** The top categories as toggle buttons; the selected one's lines show below. */
export function CategoryTabs({ groups }: { groups: CategoryGroup[] }) {
  const [selectedId, setSelectedId] = useState(groups[0].category.id);
  const selected = groups.find((g) => g.category.id === selectedId) ?? groups[0];

  return (
    <>
      <div
        role="group"
        aria-label="Top categories"
        className="flex flex-wrap justify-center gap-x-[26px] gap-y-3"
      >
        {groups.map(({ category }) => (
          <button
            key={category.id}
            type="button"
            className="chip"
            aria-pressed={category.id === selected.category.id}
            onClick={() => setSelectedId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <section aria-label={`Lines in ${selected.category.name}`} className="mt-[52px] w-full">
        <LineGrid lines={selected.lines} emptyText="No lines here yet." />
      </section>
    </>
  );
}
