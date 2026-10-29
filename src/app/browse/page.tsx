import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Hedgehog } from "@/components/autumn";
import { LineGrid } from "@/components/line-grid";
import { SearchBox } from "@/components/search-box";
import { CardsSkeleton } from "@/components/skeletons";
import { getCategory, getLines, getPopularCategories, searchLines } from "@/lib/queries";
import { browsePath, normalize, parseId } from "@/lib/text";

export const metadata: Metadata = { title: "Browse" };

const CATEGORY_CHIPS = 30;

export default function BrowsePage({ searchParams }: PageProps<"/browse">) {
  return (
    <div className="flex w-full flex-col items-center px-6 pt-[30px] pb-24 md:px-[83px]">
      <h1 className="sr-only">Browse lines</h1>
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BrowseContent({ searchParams }: Pick<PageProps<"/browse">, "searchParams">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? normalize(params.q).slice(0, 100) : "";
  const categoryId = parseId(params.category);
  const before = parseId(params.before);

  const [popular, selected, page] = await Promise.all([
    getPopularCategories(CATEGORY_CHIPS),
    categoryId ? getCategory(categoryId) : null,
    q ? searchLines(q, categoryId, before) : getLines(categoryId, before),
  ]);
  // Keep a selected category visible even when it isn't among the most popular.
  const chips =
    selected && !popular.some((c) => c.id === selected.id) ? [selected, ...popular] : popular;

  return (
    <>
      {/* Keyed by the query so the field remounts, showing the current search
          (or none), whenever it changes — e.g. after "Clear search". */}
      <SearchBox key={q} q={q} category={selected?.id ?? null} />

      <nav aria-label="Categories" className="mt-12 flex flex-wrap justify-center gap-x-[26px] gap-y-3">
        <Link href={browsePath({ q })} className="chip" aria-current={selected ? undefined : "page"}>
          All
        </Link>
        {chips.map((category) => (
          <Link
            key={category.id}
            href={browsePath({ category: category.id, q })}
            className="chip"
            aria-current={category.id === selected?.id ? "page" : undefined}
          >
            {category.name}
          </Link>
        ))}
        <Hedgehog className="w-[54px] self-end" />
      </nav>

      {q && (
        <p className="mt-6 font-hand text-lg text-slate">
          Lines matching “{q}” ·{" "}
          <Link href={browsePath({ category: selected?.id })} className="underline underline-offset-4">
            Clear search
          </Link>
        </p>
      )}

      <div className="mt-9 w-full">
        <LineGrid
          lines={page.lines}
          emptyText={q ? "No lines match that search yet." : "No lines here yet."}
        />
      </div>

      {page.nextCursor && (
        <Link
          href={browsePath({ category: selected?.id, q, before: page.nextCursor })}
          className="btn btn-outline mt-10"
        >
          Older lines
        </Link>
      )}
    </>
  );
}

function BrowseSkeleton() {
  return (
    <>
      <div aria-hidden="true" className="h-11 w-full max-w-[420px] rounded-[15px] border border-ink" />
      <div className="mt-[150px] w-full">
        <CardsSkeleton />
      </div>
    </>
  );
}
