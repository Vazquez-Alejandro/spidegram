export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/5 ${className}`}
    />
  )
}

export function PhotoCardSkeleton() {
  return (
    <div className="aspect-square rounded-2xl bg-surface overflow-hidden ring-1 ring-white/5">
      <Skeleton className="w-full h-full rounded-none" />
    </div>
  )
}

export function GroupCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

export function FeedCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="px-4 py-3">
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
