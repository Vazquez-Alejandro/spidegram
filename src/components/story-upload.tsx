"use client"

import { useState } from "react"
import { uploadStory } from "@/lib/supabase/stories"

export function StoryUpload({ groupId }: { groupId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("group_id", groupId)

    try {
      await uploadStory(formData)
      setFile(null)
      setPreview(null)
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function cancel() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {preview ? (
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface border border-border">
          <div className="w-full aspect-[9/16] max-w-[200px] rounded-xl overflow-hidden ring-1 ring-white/10">
            <img src={preview} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {uploading ? "Posting..." : "Share Story"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={uploading}
              className="rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-950/30 px-4 py-2 rounded-xl">{error}</p>}
        </div>
      ) : (
        <label className="flex flex-col items-center gap-1 cursor-pointer group">
          <input
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] text-gray-500">Add Story</span>
        </label>
      )}
    </form>
  )
}
