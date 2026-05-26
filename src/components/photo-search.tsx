"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PhotoLightbox } from "./photo-lightbox"

type Photo = {
  id: string
  url: string
  caption: string | null
  created_at: string
}

export function PhotoSearch({
  groupId,
}: {
  groupId: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Photo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const supabase = createClient()
    const { data } = await supabase
      .from("photos")
      .select("id, url, caption, created_at")
      .eq("group_id", groupId)
      .eq("status", "approved")
      .ilike("caption", `%${query.trim()}%`)
      .order("created_at", { ascending: false })
      .limit(50)

    setResults(data ?? [])
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search photos by caption..."
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
      </form>

      {loading && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {searched && !loading && results && results.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">No photos match &quot;{query}&quot;</p>
      )}

      {results && results.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-2xl bg-surface overflow-hidden group relative ring-1 ring-white/5 hover:ring-primary/30 transition-all"
            >
              <PhotoLightbox src={photo.url} alt={photo.caption ?? ""}>
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </PhotoLightbox>
              <a
                href={`/photos/${photo.id}`}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end"
              >
                {photo.caption && (
                  <p className="text-sm font-medium truncate drop-shadow-lg">{photo.caption}</p>
                )}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
