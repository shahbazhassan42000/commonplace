import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-[967px] flex-col items-center px-6 pt-8 pb-24">
      <h1 className="text-center text-3xl text-balance sm:text-4xl">
        A commonplace book, kept in public
      </h1>
      <hr className="mt-[45px] w-[132px] border-t-[5px] border-burgundy" />
      <div className="mt-[18px] font-hand text-slate">
        <p className="text-xl sm:text-[22px]">
          Commonplace is a home for the lines that stay with you - quotes, poems, and passages
          worth keeping. Anyone can submit a line, and anyone can browse what others have kept.
          No accounts, no noise.
        </p>
        <p className="text-lg sm:text-xl">Just words that mattered to someone once.</p>
      </div>
    </div>
  );
}
