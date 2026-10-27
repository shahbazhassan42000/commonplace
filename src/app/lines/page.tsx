import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LineList } from "@/components/line-list";
import { LinesSkeleton } from "@/components/skeletons";
import { getLatestLines } from "@/lib/queries";
import { parseId } from "@/lib/text";

export const metadata: Metadata = { title: "All lines" };

export default function LinesPage({ searchParams }: PageProps<"/lines">) {
  return (
    <section className="flex flex-col gap-8">
      <h1 className="font-serif text-4xl font-medium tracking-tight">All lines</h1>
      <Suspense fallback={<LinesSkeleton />}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Feed({ searchParams }: Pick<PageProps<"/lines">, "searchParams">) {
  const before = parseId((await searchParams).before);
  const page = await getLatestLines(before);
  return (
    <>
      {before && (
        <Link href="/lines" className="link self-start text-sm">
          Back to the newest
        </Link>
      )}
      <LineList page={page} basePath="/lines" emptyText="No lines here yet." />
    </>
  );
}
