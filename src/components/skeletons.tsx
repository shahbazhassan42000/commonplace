export function CardsSkeleton() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[46px] gap-y-7">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} aria-hidden="true" className="h-[100px] animate-pulse rounded-[8px] bg-blush" />
      ))}
    </div>
  );
}
