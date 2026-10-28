export function CardsSkeleton() {
  // Varied heights in a column layout preview the masonry grid while it loads.
  const heights = ["h-[120px]", "h-[200px]", "h-[90px]", "h-[160px]", "h-[110px]", "h-[180px]"];
  return (
    <div className="w-full columns-[300px] gap-x-[46px]">
      <span className="sr-only">Loading…</span>
      {heights.map((h, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`${h} mb-7 animate-pulse break-inside-avoid rounded-[8px] bg-blush`}
        />
      ))}
    </div>
  );
}
