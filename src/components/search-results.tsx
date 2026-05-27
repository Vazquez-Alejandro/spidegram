"use client"

import { useState } from "react"

type Photo = {
  id: string
  url: string
  caption: string | null
  created_at: string
  group_id: string
  uploader_id: string
}

type Group = {
  id: string
  name: string
  description: string | null
  cover_url: string | null
}

type User = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

type Tab = "photos" | "groups" | "people"

export function SearchResults({
  query,
  photos,
  groups,
  users,
}: {
  query: string
  photos: Photo[]
  groups: Group[]
  users: User[]
}) {
  const [tab, setTab] = useState<Tab>("photos")

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-medium">Search across Spidegram</p>
        <p className="mt-1 text-sm">Find photos, groups, and people</p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "photos", label: "Photos", count: photos.length },
    { id: "groups", label: "Groups", count: groups.length },
    { id: "people", label: "People", count: users.length },
  ]

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t.id
                ? "border-primary text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {tab === "photos" && (
        <div>
          {photos.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No photos found for &quot;{query}&quot;</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p) => (
                <a
                  key={p.id}
                  href={`/photos/${p.id}`}
                  className="aspect-square rounded-2xl bg-surface overflow-hidden group relative ring-1 ring-white/5 hover:ring-primary/30 transition-all"
                >
                  <img
                    src={p.url}
                    alt={p.caption ?? ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {p.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                      <p className="text-sm font-medium truncate">{p.caption}</p>
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "groups" && (
        <div>
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No groups found for &quot;{query}&quot;</p>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <a
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 hover:border-primary/20 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {g.cover_url ? (
                      <img src={g.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "🕸️"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{g.name}</p>
                    {g.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{g.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "people" && (
        <div>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No people found for &quot;{query}&quot;</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <a
                  key={u.id}
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      (u.full_name?.charAt(0) || u.username?.charAt(0) || "?").toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.full_name || u.username || "Anon"}</p>
                    {u.username && u.full_name && (
                      <p className="text-xs text-gray-500">@{u.username}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
