"use client"

import { useState, useEffect } from "react"
import { GroupCardSkeleton } from "./skeleton"

type Group = {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  is_public: boolean
  role: string
  created_at: string
}

export function DashboardClient({ groups }: { groups: Group[] }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, i) => (
        <a
          key={group.id}
          href={`/groups/${group.id}`}
          className="group rounded-2xl border border-border bg-surface hover:border-primary/30 hover:bg-surface/80 transition-all hover:shadow-lg hover:shadow-primary/5"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div
            className="h-32 rounded-t-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-surface flex items-center justify-center relative overflow-hidden"
          >
            {group.cover_url ? (
              <img src={group.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-4xl opacity-50 group-hover:opacity-75 transition-opacity">
                🕸️
              </span>
            )}
            {group.is_public && (
              <span className="absolute top-2 right-2 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                Public
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold text-base truncate">{group.name}</h2>
              <span className="shrink-0 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize ml-2">
                {group.role === "admin" ? "👑 " : ""}{group.role}
              </span>
            </div>
            {group.description && (
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{group.description}</p>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}
