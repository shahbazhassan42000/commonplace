import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/queries";
import { categoryPath } from "@/lib/text";

export const metadata: Metadata = { title: "All categories" };

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-medium tracking-tight">All categories</h1>
        <p className="text-muted">
          {categories.length === 1 ? "1 category" : `${categories.length} categories`}, A to Z.
        </p>
      </div>
      {categories.length === 0 ? (
        <p className="text-muted">
          No categories yet. <Link href="/" className="link">Post the first line</Link>.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={categoryPath(category)} className="chip">
                {category.name}
                <span className="opacity-60">{category.lineCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
