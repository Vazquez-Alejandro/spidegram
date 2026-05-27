export default function PhotoLoading() {
  return (
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
      <div className="flex gap-4 items-start">
        <Skeleton className="w-3/5 aspect-[4/3] rounded-2xl" />
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="w-6 h-6 rounded-full mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
}
