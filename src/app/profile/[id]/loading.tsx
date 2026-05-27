import { PhotoCardSkeleton } from "@/components/skeleton"

export default function ProfileLoading() {
  return (
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
      <div className="flex items-center gap-5 mb-8">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PhotoCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
}
