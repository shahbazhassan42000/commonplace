export function CardsSkeleton() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(264px,1fr))] gap-x-[46px] gap-y-6">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} aria-hidden="true" className="h-[77px] animate-pulse rounded-[8px] bg-blush" />
      ))}
    </div>
  );
}
