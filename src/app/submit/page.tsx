import type { Metadata } from "next";
import { Suspense } from "react";
import { Composer } from "@/components/composer";
import { getPopularCategories } from "@/lib/queries";

export const metadata: Metadata = { title: "Share a line" };

export default async function SubmitPage() {
  const categories = await getPopularCategories(50);

  return (
    <div className="flex w-full flex-col items-center px-6 pt-[21px] pb-24">
      <h1 className="text-center text-[26px] md:text-[30px]">Share a line worth keeping</h1>
      <div className="mt-[34px] flex w-full justify-center">
        {/* The rich-text editor is client-only (and uses unstable values), so
            it streams in rather than being part of the static prerender. */}
        <Suspense fallback={<ComposerFallback />}>
          <Composer categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}

function ComposerFallback() {
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-4" aria-hidden="true">
      <div className="h-8 w-28 rounded bg-blush" />
      <div className="h-[207px] w-full rounded-[15px] border border-burgundy bg-parchment" />
      <div className="mt-2 h-10 w-full max-w-[400px] rounded-[15px] bg-blush" />
    </div>
  );
}
