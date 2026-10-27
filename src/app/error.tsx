"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 px-6 pt-16 pb-24 text-center">
      <h1 className="text-4xl">Something went wrong.</h1>
      <p className="font-hand text-xl text-slate">The page couldn’t load. It’s usually temporary.</p>
      <button type="button" onClick={() => retry()} className="btn btn-red mt-4">
        Try again
      </button>
    </div>
  );
}
