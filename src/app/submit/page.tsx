import type { Metadata } from "next";
import { Composer } from "@/components/composer";
import { getPopularCategories } from "@/lib/queries";

export const metadata: Metadata = { title: "Share a line" };

export default async function SubmitPage() {
  const categories = await getPopularCategories(50);

  return (
    <div className="mx-auto flex w-full max-w-[1406px] flex-col items-center px-6 pt-[21px] pb-24">
      <h1 className="text-center text-xl">Share a line worth keeping</h1>
      <div className="mt-[34px] flex w-full justify-center">
        <Composer categories={categories} />
      </div>
    </div>
  );
}
