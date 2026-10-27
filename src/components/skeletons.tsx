export function LinesSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <span className="sr-only">Loading…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="flex flex-col gap-3">
          <div className="h-7 w-11/12 animate-pulse rounded bg-rule" />
          <div className="h-7 w-2/3 animate-pulse rounded bg-rule" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-rule" />
        </div>
      ))}
    </div>
  );
}

export function HeadingSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="h-4 w-28 animate-pulse rounded bg-rule" />
      <div className="h-10 w-1/2 animate-pulse rounded bg-rule" />
    </div>
  );
}
