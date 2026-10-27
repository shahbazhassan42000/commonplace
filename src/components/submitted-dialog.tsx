"use client";

import { Roboto } from "next/font/google";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { linePath } from "@/lib/text";

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export function SubmittedDialog({
  line,
  onClose,
}: {
  line: { id: string };
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="submitted-title"
      className="m-auto hidden h-[min(510px,calc(100%-32px))] w-[min(795px,calc(100%-32px))] flex-col items-center justify-center rounded-[20px] bg-[rgb(122_59_59/0.92)] p-8 text-center text-white backdrop:bg-transparent open:flex"
    >
      <p id="submitted-title" className={`${roboto.className} text-[40px] leading-9`}>
        Submitted!
      </p>
      <p className="mt-7 font-hand text-6xl leading-none sm:text-[96px]">Thank you!</p>
      <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] text-parchment">
        <form method="dialog">
          <button className="underline underline-offset-4 hover:text-white">
            Share another line
          </button>
        </form>
        <Link href={linePath(line)} className="underline underline-offset-4 hover:text-white">
          See your line
        </Link>
      </div>
    </dialog>
  );
}
