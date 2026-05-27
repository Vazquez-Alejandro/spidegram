"use client"

import { useState } from "react"

type Album = {
  id: string
  name: string
  photo_count: number
}

export function AlbumTabs({
  albums,
  activeAlbum,
  onSelect,
  onCreate,
}: {
  albums: Album[]
  activeAlbum: string | null
  onSelect: (albumId: string | null) => void
  onCreate: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <button
        onClick={() => onSelect(null)}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
          activeAlbum === null
            ? "bg-primary/20 text-primary"
            : "bg-surface border border-border text-gray-400 hover:text-white hover:border-primary/30"
        }`}
      >
        All
      </button>
      {albums.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a.id)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeAlbum === a.id
              ? "bg-primary/20 text-primary"
              : "bg-surface border border-border text-gray-400 hover:text-white hover:border-primary/30"
          }`}
        >
          {a.name}
          <span className="text-[10px] opacity-60">({a.photo_count})</span>
        </button>
      ))}
      <button
        onClick={onCreate}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-border text-gray-500 hover:text-white hover:border-primary/30 transition-all"
      >
        + New album
      </button>
    </div>
  )
}

export function CreateAlbumForm({
  groupId,
  onDone,
}: {
  groupId: string
  onDone: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setSaving(true)
    const fd = new FormData()
    fd.set("groupId", groupId)
    fd.set("name", name)
    fd.set("description", description)

    const res = await fetch("/api/album", {
      method: "POST",
      body: fd,
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setSaving(false)
      return
    }

    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-surface border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">New album</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Album name"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
