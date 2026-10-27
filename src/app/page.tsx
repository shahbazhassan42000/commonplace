import Link from "next/link";
import { Composer } from "@/components/composer";
import { LineList } from "@/components/line-list";
import { getLatestLines, getPopularCategories } from "@/lib/queries";
import { categoryPath } from "@/lib/text";

export default async function Home() {
  const [categories, latest] = await Promise.all([
    getPopularCategories(50),
    getLatestLines(null),
  ]);
  const top = categories.slice(0, 5);

  return (
    <>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            Leave a line worth keeping.
          </h1>
          <p className="max-w-prose text-lg text-muted">
            A public commonplace book. No sign-up: write one line, file it under a
            category, and it joins the collection.
          </p>
        </div>
        <Composer categories={categories} />
      </section>

      <section aria-labelledby="top-categories" className="flex flex-col gap-4">
        <h2 id="top-categories" className="text-sm font-semibold tracking-wide text-muted uppercase">
          Top categories
        </h2>
        <ul className="flex flex-wrap gap-2">
          {top.map((category) => (
            <li key={category.id}>
              <Link href={categoryPath(category)} className="chip">
                {category.name}
                <span className="opacity-60">{category.lineCount}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/categories" className="chip">
              Browse all <span aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="latest" className="flex flex-col gap-6">
        <h2 id="latest" className="text-sm font-semibold tracking-wide text-muted uppercase">
          Latest lines
        </h2>
        <LineList page={latest} basePath="/lines" emptyText="No lines yet. Be the first." />
      </section>
    </>
  );
}
