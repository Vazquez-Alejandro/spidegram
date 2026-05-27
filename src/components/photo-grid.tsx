"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PhotoLightbox } from "./photo-lightbox"

type Photo = {
  id: string
  url: string
  caption: string | null
  created_at: string
}

export function PhotoGrid({
  initialPhotos,
  groupId,
  albumId = null,
  pageSize = 12,
  isAdmin = false,
  currentCover,
}: {
  initialPhotos: Photo[]
  groupId: string
  albumId?: string | null
  pageSize?: number
  isAdmin?: boolean
  currentCover?: string | null
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || loading || !hasMore) return
        setLoading(true)

        const supabase = createClient()
        const from = photos.length
        const to = from + pageSize - 1

        let query = supabase
          .from("photos")
          .select("id, url, caption, created_at")
          .eq("group_id", groupId)
          .eq("status", "approved")

        if (albumId) {
          query = query.eq("album_id", albumId)
        }

        const { data } = await query
          .order("created_at", { ascending: false })
          .range(from, to)

        if (data && data.length > 0) {
          setPhotos((prev) => [...prev, ...data])
        }
        if (!data || data.length < pageSize) {
          setHasMore(false)
        }
        setLoading(false)
      },
      { threshold: 0.1 },
    )

    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [photos.length, loading, hasMore, groupId, albumId, pageSize])

  async function handleSetCover(photoUrl: string) {
    try {
      const res = await fetch("/api/set-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, photoUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Failed to set cover")
        return
      }
      window.location.reload()
    } catch {
      alert("Network error")
    }
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm">No photos yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => {
          const isCover = currentCover === photo.url
          return (
            <div
              key={photo.id}
              className={`aspect-square rounded-2xl bg-surface overflow-hidden group relative ring-1 transition-all ${
                isCover
                  ? "ring-primary ring-2"
                  : "ring-white/5 hover:ring-primary/30"
              }`}
            >
              <PhotoLightbox src={photo.url} alt={photo.caption ?? ""}>
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </PhotoLightbox>
              {isCover && (
                <span className="absolute top-2 left-2 text-[10px] font-medium bg-primary/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                {photo.caption && (
                  <p className="text-sm font-medium truncate drop-shadow-lg">{photo.caption}</p>
                )}
                <div className="flex gap-2 mt-1">
                  <a
                    href={`/photos/${photo.id}`}
                    className="text-[11px] text-gray-300 hover:text-white transition-colors"
                  >
                    View details →
                  </a>
                  {isAdmin && !isCover && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleSetCover(photo.url)
                      }}
                      className="text-[11px] text-primary hover:text-white transition-colors"
                    >
                      Set as cover
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div ref={loaderRef} className="flex justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading more...
          </div>
        )}
        {!hasMore && photos.length > 0 && (
          <p className="text-xs text-gray-600">All photos loaded</p>
        )}
      </div>
    </>
  )
}
