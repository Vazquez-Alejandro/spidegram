import { Skeleton } from "@/components/skeleton"

export default function AdminLoading() {
  return (
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12">
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface border border-border p-5">
            <Skeleton className="w-10 h-10 rounded-xl mb-3" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </main>
  )
}
