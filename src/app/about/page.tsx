import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center px-6 pt-10 pb-24">
      <h1 className="text-center text-4xl text-balance md:text-[44px]">
        A commonplace book, kept in public
      </h1>
      <hr className="mt-[45px] w-[132px] border-t-[5px] border-burgundy" />
      <div className="mt-6 font-hand text-slate">
        <p className="text-[22px] md:text-2xl">
          Commonplace is a home for the lines that stay with you - quotes, poems, and passages
          worth keeping. Anyone can submit a line, and anyone can browse what others have kept.
          No accounts, no noise.
        </p>
        <p className="text-xl md:text-[22px]">Just words that mattered to someone once.</p>
      </div>
    </div>
  );
}
