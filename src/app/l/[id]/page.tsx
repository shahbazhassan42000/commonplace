import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RelativeTime } from "@/components/relative-time";
import { ShareButton } from "@/components/share-button";
import { getLine } from "@/lib/queries";
import { browsePath, cardPath, parseId, preview } from "@/lib/text";

type Props = PageProps<"/l/[id]">;

async function findLine(params: Props["params"]) {
  const id = parseId((await params).id);
  return id ? getLine(id) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const line = await findLine(params);
  if (!line) return { title: "Line not found" };
  const title = preview(line.text, 60);
  const ogTitle = preview(line.text, 90);
  const description = `${line.source ? `${line.source} · ` : ""}Kept under ${line.category.name} on Commonplace.`;
  const image = { url: cardPath(line), width: 1200, height: 630, alt: preview(line.text, 120) };
  return {
    title,
    description,
    openGraph: { type: "article", title: ogTitle, description, images: [image] },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [image] },
  };
}

export default function LinePage({ params }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-[795px] flex-col items-center px-6 pt-10 pb-24">
      <Suspense fallback={<div aria-hidden="true" className="h-40 w-full animate-pulse rounded-[15px] bg-blush" />}>
        <LineContent params={params} />
      </Suspense>
    </div>
  );
}

async function LineContent({ params }: Pick<Props, "params">) {
  const line = await findLine(params);
  if (!line) notFound();

  return (
    <article className="flex w-full flex-col items-center gap-10 text-center">
      <figure className="flex flex-col items-center gap-4">
        <blockquote
          className="rich font-hand text-[32px] leading-snug break-words text-burgundy md:text-[44px]"
          dangerouslySetInnerHTML={{ __html: line.html }}
        />
        <figcaption className="text-lg text-slate">-{line.source ?? "Anonymous"}</figcaption>
      </figure>
      <div className="flex flex-wrap items-center justify-center gap-4 text-[15px] text-slate">
        <Link href={browsePath({ category: line.category.id })} className="chip">
          {line.category.name}
        </Link>
        <RelativeTime iso={line.createdAt} />
      </div>

      <section aria-labelledby="share" className="flex w-full flex-col items-center gap-5">
        <h2 id="share" className="text-sm tracking-[0.08em] text-slate uppercase">
          Share this line
        </h2>
        <Image
          src={cardPath(line)}
          alt={`Share card: “${preview(line.text, 120)}”`}
          width={1200}
          height={630}
          unoptimized
          className="h-auto w-full rounded-[15px] border border-burgundy"
        />
        <div className="split">
          <a href={`/l/${line.id}/card/download`} className="btn btn-red" download>
            Download image
          </a>
          <ShareButton path={`/l/${line.id}`} text={line.text} />
        </div>
      </section>
    </article>
  );
}
