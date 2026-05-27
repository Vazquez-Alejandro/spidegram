import { FeedCardSkeleton } from "@/components/skeleton"

export default function FeedLoading() {
  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <Skeleton className="h-7 w-24 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
}
