import { Skeleton } from "@/components/skeleton"

export default function SearchLoading() {
  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    </main>
  )
}
