import Link from "next/link";
import type { LineItem } from "@/lib/queries";
import { linePath } from "@/lib/text";

export function LineGrid({ lines, emptyText }: { lines: LineItem[]; emptyText: string }) {
  if (lines.length === 0) {
    return <p className="text-center font-hand text-lg text-slate">{emptyText}</p>;
  }
  return (
    <ul className="grid w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[46px] gap-y-7">
      {lines.map((line) => (
        <li key={line.id} className="line-card">
          {/* The link's ::after stretches over the whole card. */}
          <Link
            href={linePath(line)}
            className="font-hand text-[19px] leading-snug break-words after:absolute after:inset-0 after:rounded-[8px]"
          >
            {line.body}
          </Link>
          <span className="self-end text-[15px]">{line.source ?? "Anonymous"}</span>
        </li>
      ))}
    </ul>
  );
}
