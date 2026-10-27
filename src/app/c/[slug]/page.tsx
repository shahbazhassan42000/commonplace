import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Composer } from "@/components/composer";
import { LineList } from "@/components/line-list";
import { HeadingSkeleton, LinesSkeleton } from "@/components/skeletons";
import { getCategory, getCategoryLines, getPopularCategories } from "@/lib/queries";
import { categoryPath, parseId, parseIdSegment } from "@/lib/text";

type Props = PageProps<"/c/[slug]">;

async function findCategory(params: Props["params"]) {
  const id = parseIdSegment((await params).slug);
  return id ? getCategory(id) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await findCategory(params);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `Lines filed under ${category.name} on Commonplace.`,
    alternates: { canonical: categoryPath(category) },
  };
}

export default function CategoryPage({ params, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8">
          <HeadingSkeleton />
          <LinesSkeleton />
        </div>
      }
    >
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryContent({ params, searchParams }: Props) {
  const category = await findCategory(params);
  if (!category) notFound();

  const before = parseId((await searchParams).before);
  const [page, options] = await Promise.all([
    getCategoryLines(category.id, before),
    getPopularCategories(50),
  ]);
  const path = categoryPath(category);

  return (
    <>
      <header className="flex flex-col gap-2">
        <Link href="/categories" className="text-sm text-muted hover:text-ink">
          <span aria-hidden="true">←</span> All categories
        </Link>
        <h1 className="font-serif text-4xl font-medium tracking-tight break-words sm:text-5xl">
          {category.name}
        </h1>
        <p className="text-muted">
          {category.lineCount === 1 ? "1 line" : `${category.lineCount} lines`}
        </p>
      </header>

      <Composer categories={options} defaultCategory={category.name} />

      <section aria-label={`Lines in ${category.name}`} className="flex flex-col gap-6">
        {before && (
          <Link href={path} className="link self-start text-sm">
            Back to the newest
          </Link>
        )}
        <LineList
          page={page}
          basePath={path}
          showCategory={false}
          emptyText="No lines in this category yet."
        />
      </section>
    </>
  );
}
