import Link from "next/link";
import type { LineCard } from "@/lib/queries";
import { linePath } from "@/lib/text";

export function LineGrid({ lines, emptyText }: { lines: LineCard[]; emptyText: string }) {
  if (lines.length === 0) {
    return <p className="text-center font-hand text-lg text-slate">{emptyText}</p>;
  }
  return (
    <ul className="w-full columns-[300px] gap-x-[46px]">
      {lines.map((line) => (
        <li key={line.id} className="line-card mb-7 break-inside-avoid">
          {/* The link's ::after stretches over the whole card. */}
          <Link href={linePath(line)} className="block after:absolute after:inset-0 after:rounded-[8px]">
            <div
              className="rich font-hand text-[19px] leading-snug break-words"
              dangerouslySetInnerHTML={{ __html: line.preview }}
            />
          </Link>
          <span className="self-end text-[15px]">{line.source ?? "Anonymous"}</span>
        </li>
      ))}
    </ul>
  );
}
