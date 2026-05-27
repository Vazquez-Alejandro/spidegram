"use client"

type MemberStat = {
  user_id: string
  name: string
  photo_count: number
  last_upload: string | null
}

export function GroupAnalytics({
  totalPhotos,
  totalMembers,
  pendingCount,
  memberStats,
  createdAt,
}: {
  totalPhotos: number
  totalMembers: number
  pendingCount: number
  memberStats: MemberStat[]
  createdAt: string
}) {
  const daysSinceCreation = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    ),
  )

  const uploadsPerDay = (totalPhotos / daysSinceCreation).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="text-2xl font-bold">{totalPhotos}</p>
          <p className="text-xs text-gray-500 mt-1">Photos</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="text-2xl font-bold">{totalMembers}</p>
          <p className="text-xs text-gray-500 mt-1">Members</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="text-2xl font-bold">{uploadsPerDay}</p>
          <p className="text-xs text-gray-500 mt-1">Photos / day</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-border p-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Top contributors
        </h3>
        <div className="space-y-2">
          {memberStats.length === 0 ? (
            <p className="text-sm text-gray-500">No data yet</p>
          ) : (
            memberStats.map((m, i) => (
              <div
                key={m.user_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-500 w-5 shrink-0">
                    {i + 1}.
                  </span>
                  <span className="text-sm truncate">{m.name}</span>
                </div>
                <span className="text-sm font-medium shrink-0 ml-2">
                  {m.photo_count} {m.photo_count === 1 ? "photo" : "photos"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
