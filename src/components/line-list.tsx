import Link from "next/link";
import type { LineItem, LinePage } from "@/lib/queries";
import { categoryPath, linePath } from "@/lib/text";
import { RelativeTime } from "./relative-time";

export function LineList({
  page,
  basePath,
  showCategory = true,
  emptyText,
}: {
  page: LinePage;
  /** Path that accepts ?before=<cursor> for the next page. */
  basePath: string;
  showCategory?: boolean;
  emptyText: string;
}) {
  if (page.lines.length === 0) {
    return <p className="text-muted">{emptyText}</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col divide-y divide-rule">
        {page.lines.map((line) => (
          <LineRow key={line.id} line={line} showCategory={showCategory} />
        ))}
      </ol>
      {page.nextCursor && (
        <Link href={`${basePath}?before=${page.nextCursor}`} className="link self-start">
          Older lines
        </Link>
      )}
    </div>
  );
}

function LineRow({ line, showCategory }: { line: LineItem; showCategory: boolean }) {
  return (
    <li className="flex flex-col gap-3 py-6 first:pt-0">
      <p className="font-serif text-2xl leading-snug text-pretty break-words">{line.body}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        {showCategory && (
          <Link href={categoryPath(line.category)} className="chip">
            {line.category.name}
          </Link>
        )}
        <Link href={linePath(line)} className="hover:text-ink" aria-label="Permalink">
          <RelativeTime iso={line.createdAt} />
        </Link>
      </div>
    </li>
  );
}
