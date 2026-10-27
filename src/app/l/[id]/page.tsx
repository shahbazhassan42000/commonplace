import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RelativeTime } from "@/components/relative-time";
import { ShareButton } from "@/components/share-button";
import { LinesSkeleton } from "@/components/skeletons";
import { getLine } from "@/lib/queries";
import { cardPath, categoryPath, parseId } from "@/lib/text";

type Props = PageProps<"/l/[id]">;

async function findLine(params: Props["params"]) {
  const id = parseId((await params).id);
  return id ? getLine(id) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const line = await findLine(params);
  if (!line) return { title: "Line not found" };
  const title = line.body.length > 60 ? `${line.body.slice(0, 57).trimEnd()}…` : line.body;
  const description = `Filed under ${line.category.name} on Commonplace.`;
  const image = { url: cardPath(line), width: 1200, height: 630, alt: line.body };
  return {
    title,
    description,
    openGraph: { type: "article", title: line.body, description, images: [image] },
    twitter: { card: "summary_large_image", title: line.body, description, images: [image] },
  };
}

export default function LinePage({ params }: Props) {
  return (
    <Suspense fallback={<LinesSkeleton />}>
      <LineContent params={params} />
    </Suspense>
  );
}

async function LineContent({ params }: Pick<Props, "params">) {
  const line = await findLine(params);
  if (!line) notFound();

  return (
    <article className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <p className="font-serif text-4xl leading-tight text-balance break-words sm:text-5xl">
          {line.body}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <Link href={categoryPath(line.category)} className="chip">
            {line.category.name}
          </Link>
          <RelativeTime iso={line.createdAt} />
        </div>
      </div>

      <section aria-labelledby="share" className="flex flex-col gap-4">
        <h2 id="share" className="text-sm font-semibold tracking-wide text-muted uppercase">
          Share this line
        </h2>
        <Image
          src={cardPath(line)}
          alt={`Share card: “${line.body}”`}
          width={1200}
          height={630}
          unoptimized
          className="h-auto w-full rounded-[var(--radius)] border border-rule"
        />
        <div className="flex flex-wrap gap-3">
          <a href={`/l/${line.id}/card/download`} className="button" download>
            Download image
          </a>
          <ShareButton path={`/l/${line.id}`} text={line.body} />
        </div>
      </section>
    </article>
  );
}
