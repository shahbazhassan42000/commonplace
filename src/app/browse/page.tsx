import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { LineGrid } from "@/components/line-grid";
import { CardsSkeleton } from "@/components/skeletons";
import { getCategory, getLines, getPopularCategories, searchLines } from "@/lib/queries";
import { browsePath, normalize, parseId } from "@/lib/text";

export const metadata: Metadata = { title: "Browse" };

const CATEGORY_CHIPS = 30;

export default function BrowsePage({ searchParams }: PageProps<"/browse">) {
  return (
    <div className="mx-auto flex w-full max-w-[1406px] flex-col items-center px-6 pt-[30px] pb-24 sm:px-[59px]">
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
      <Form action="/browse" role="search" className="w-full max-w-[277px]">
        {selected && <input type="hidden" name="category" value={selected.id} />}
        <label htmlFor="q" className="sr-only">
          Search by a keyword or an author
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder="Search by a Keyword or an Author"
          className="h-8 w-full rounded-[15px] border border-ink bg-parchment px-4 text-center text-[15px] placeholder:text-slate"
        />
      </Form>

      <nav aria-label="Categories" className="mt-[50px] flex flex-wrap justify-center gap-x-[26px] gap-y-3">
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
      </nav>

      {q && (
        <p className="mt-6 font-hand text-[15px] text-slate">
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
      <div aria-hidden="true" className="h-8 w-full max-w-[277px] rounded-[15px] border border-ink" />
      <div className="mt-[132px] w-full">
        <CardsSkeleton />
      </div>
    </>
  );
}
