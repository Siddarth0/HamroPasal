/** Loading placeholders used while live catalog data is being fetched. */

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductCardSkeletonRow({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
}

export function CategoryCircleSkeleton() {
  return (
    <div className="flex w-16 flex-col items-center gap-2">
      <span className="h-14 w-14 animate-pulse rounded-full bg-muted" />
      <span className="h-2.5 w-12 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-11 w-11 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <span className="block h-3.5 w-2/3 animate-pulse rounded bg-muted" />
          <span className="block h-2.5 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
