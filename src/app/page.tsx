import Link from "next/link";
import { FallingLeaves, SleepyFox } from "@/components/autumn";
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
      <div className="relative isolate flex w-full flex-col items-center px-6 pt-[21px] pb-24 md:px-[50px]">
        <FallingLeaves className="absolute inset-x-0 top-0 -z-10" />
        <h1 className="sr-only">Commonplace</h1>
        <section aria-labelledby="line-of-the-day" className="flex flex-col items-center text-center">
          <h2 id="line-of-the-day" className="text-sm tracking-[0.08em] text-slate uppercase">
            Line of the day
          </h2>
          {lineOfTheDay ? (
            <figure className="mt-5 flex flex-col items-center gap-3">
              <blockquote className="max-h-[15rem] max-w-[760px] overflow-hidden text-2xl leading-snug break-words md:text-[28px]">
                <Link href={linePath(lineOfTheDay)} className="block hover:text-burgundy">
                  <div className="rich" dangerouslySetInnerHTML={{ __html: lineOfTheDay.preview }} />
                </Link>
              </blockquote>
              <figcaption className="text-base text-slate">
                -{lineOfTheDay.source ?? "submitted by a reader"}
              </figcaption>
            </figure>
          ) : (
            <p className="mt-5 text-2xl">Nothing kept yet. The first line could be yours.</p>
          )}
        </section>

        <div className="split mt-10">
          <Link href="/submit" className="btn btn-red">
            Share a line
          </Link>
          <Link href="/browse" className="btn btn-outline">
            Browse all
          </Link>
        </div>

        {groups.length > 0 && (
          <div className="mt-9 flex w-full flex-col items-center">
            <CategoryTabs groups={groups} />
          </div>
        )}
      </div>

      <footer className="relative mt-auto flex min-h-[286px] flex-col items-center justify-end gap-2 rounded-t-[15px] bg-burgundy px-6 pt-16 pb-[51px] text-center font-hand">
        <SleepyFox className="absolute top-5 right-5 w-[88px] md:top-8 md:right-12 md:w-[140px]" />
        <p className="text-2xl text-balance text-white md:text-[32px]">
          “Great is the art of beginning, but greater is the art of ending.”
        </p>
        <Link href={browsePath({ q: "Longfellow" })} className="text-lg text-parchment hover:underline">
          Henry Wadsworth Longfellow
        </Link>
      </footer>
    </>
  );
}
