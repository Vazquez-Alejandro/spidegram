"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type PendingPhoto = {
  id: string
  url: string
  caption: string | null
  uploader_id: string
  uploader_name: string
}

export function BulkActions({
  groupId,
  photos,
}: {
  groupId: string
  photos: PendingPhoto[]
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === photos.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(photos.map((p) => p.id)))
    }
  }

  async function handleAction(action: "approve" | "reject") {
    if (selected.size === 0) return
    setLoading(true)

    await Promise.all(
      Array.from(selected).map((id) =>
        fetch("/api/bulk-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId: id, groupId, action }),
        }),
      ),
    )

    setSelected(new Set())
    setLoading(false)
    router.refresh()
  }

  if (photos.length === 0) return null

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-3 animate-fade-in">
          <span className="text-sm text-gray-400">{selected.size} selected</span>
          <button
            onClick={() => handleAction("approve")}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Approve all"}
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={loading}
            className="rounded-xl bg-red-600/80 px-3 py-1.5 text-xs font-semibold hover:bg-red-500 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Reject all"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-500 hover:text-white transition-colors ml-2"
          >
            Clear
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={selected.size === photos.length && photos.length > 0}
            onChange={toggleAll}
            className="rounded border-border bg-surface text-primary focus:ring-primary/50"
          />
          Select all
        </label>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`rounded-2xl bg-surface overflow-hidden border transition-all ${
              selected.has(photo.id)
                ? "border-primary ring-1 ring-primary/30"
                : "border-amber-900/40 hover:border-amber-700/50"
            }`}
          >
            <div className="aspect-square relative">
              <label className="absolute top-2 left-2 z-10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(photo.id)}
                  onChange={() => toggle(photo.id)}
                  className="rounded border-border bg-black/50 text-primary focus:ring-primary/50"
                />
              </label>
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-medium bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Pending
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {photo.caption && (
                <p className="text-xs text-gray-400 truncate">{photo.caption}</p>
              )}
              <p className="text-[11px] text-gray-500">by {photo.uploader_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
