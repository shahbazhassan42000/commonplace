import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1406px] flex-col items-center gap-4 px-6 pt-16 pb-24 text-center">
      <h1 className="text-4xl">Nothing here.</h1>
      <p className="font-hand text-xl text-slate">That line doesn’t exist, or the link is mistyped.</p>
      <div className="split mt-4">
        <Link href="/" className="btn btn-red">
          Home
        </Link>
        <Link href="/browse" className="btn btn-outline">
          Browse all
        </Link>
      </div>
    </div>
  );
}
