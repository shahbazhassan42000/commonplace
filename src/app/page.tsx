import Link from "next/link";
import { CategoryTabs } from "@/components/category-tabs";
import { getLineOfTheDay, getLines, getPopularCategories } from "@/lib/queries";
import { browsePath, linePath } from "@/lib/text";

const CARDS_PER_CATEGORY = 12;

export default async function Home() {
  const [lineOfTheDay, top] = await Promise.all([getLineOfTheDay(), getPopularCategories(5)]);
  const groups = await Promise.all(
    top.map(async (category) => ({
      category,
      lines: (await getLines(category.id, null)).lines.slice(0, CARDS_PER_CATEGORY),
    })),
  );

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1406px] flex-col items-center px-6 pt-[21px] pb-24 sm:px-[26px]">
        <h1 className="sr-only">Commonplace</h1>
        <section aria-labelledby="line-of-the-day" className="flex flex-col items-center text-center">
          <h2 id="line-of-the-day" className="text-xs text-slate uppercase">
            Line of the day
          </h2>
          {lineOfTheDay ? (
            <figure className="mt-[18px] flex flex-col items-center gap-3">
              <blockquote className="max-w-[640px] text-base text-balance break-words">
                <Link href={linePath(lineOfTheDay)} className="hover:text-burgundy">
                  {lineOfTheDay.body}
                </Link>
              </blockquote>
              <figcaption className="text-[10px] text-slate">
                -{lineOfTheDay.source ?? "submitted by a reader"}
              </figcaption>
            </figure>
          ) : (
            <p className="mt-[18px] text-base">Nothing kept yet. The first line could be yours.</p>
          )}
        </section>

        <div className="split mt-9">
          <Link href="/submit" className="btn btn-red">
            Share a line
          </Link>
          <Link href="/browse" className="btn btn-outline w-[110px]">
            Browse all
          </Link>
        </div>

        {groups.length > 0 && (
          <div className="mt-[30px] flex w-full flex-col items-center">
            <CategoryTabs groups={groups} />
          </div>
        )}
      </div>

      <footer className="mt-auto flex min-h-[286px] flex-col items-center justify-end gap-2 rounded-t-[15px] bg-burgundy px-6 pt-16 pb-[51px] text-center font-hand">
        <p className="text-2xl text-balance text-white">
          “Great is the art of beginning, but greater is the art of ending.”
        </p>
        <Link href={browsePath({ q: "Longfellow" })} className="text-parchment hover:underline">
          Henry Wadsworth Longfellow
        </Link>
      </footer>
    </>
  );
}
