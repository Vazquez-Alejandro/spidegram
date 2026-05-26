"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function EditCaption({
  photoId,
  groupId,
  initialCaption,
}: {
  photoId: string
  groupId: string
  initialCaption: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [caption, setCaption] = useState(initialCaption ?? "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    const formData = new FormData()
    formData.append("caption", caption)

    await fetch("/api/update-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, groupId, caption }),
    })

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? "..." : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded-xl border border-border px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      {initialCaption ? (
        <p className="text-base leading-relaxed">{initialCaption}</p>
      ) : (
        <p className="text-base text-gray-500 italic">No caption</p>
      )}
      <button
        onClick={() => setEditing(true)}
        className="text-gray-500 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        title="Edit caption"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )
}
