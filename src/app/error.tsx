"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="font-serif text-4xl font-medium tracking-tight">Something went wrong.</h1>
      <p className="text-muted">The page couldn’t load. It’s usually temporary.</p>
      <button type="button" onClick={() => retry()} className="button">
        Try again
      </button>
    </section>
  );
}
