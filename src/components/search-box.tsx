"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { browsePath } from "@/lib/text";

/**
 * The browse page's search field. Emptying it while a search is showing — with
 * its clear (×) button, Escape, or by deleting the text — goes back to the
 * unfiltered list, like the "Clear search" link.
 */
export function SearchBox({ q, category }: { q: string; category: string | null }) {
  const router = useRouter();

  return (
    <Form action="/browse" role="search" className="w-full max-w-[420px]">
      {category && <input type="hidden" name="category" value={category} />}
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
        onChange={(event) => {
          if (q && event.target.value === "") router.push(browsePath({ category }));
        }}
        className="h-11 w-full rounded-[15px] border border-ink bg-parchment px-5 text-center text-[17px] placeholder:text-slate"
      />
    </Form>
  );
}
