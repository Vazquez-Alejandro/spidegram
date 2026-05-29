import { GroupCardSkeleton, Skeleton } from "@/components/skeleton"

export default function DashboardLoading() {
  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}
