"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function PhotoUpload({ groupId }: { groupId: string }) {
  const [albums, setAlbums] = useState<{ id: string; name: string }[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("albums")
      .select("id, name")
      .eq("group_id", groupId)
      .order("name")
      .then(({ data }) => {
        if (data) setAlbums(data)
      })
  }, [groupId])
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles?.length) return
    const incoming = Array.from(newFiles)
    setFiles((prev) => [...prev, ...incoming])
    setPreviews((prev) => [
      ...prev,
      ...incoming.map((f) => URL.createObjectURL(f)),
    ])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (files.length === 0) {
      setError("No files selected")
      return
    }

    const caption = fileRef.current?.form?.querySelector<HTMLInputElement>("[name=caption]")?.value
    const isPublic = fileRef.current?.form?.querySelector<HTMLInputElement>("[name=is_public]")?.checked

    setUploading(true)

    for (const file of files) {
      const formData = new FormData()
      formData.append("groupId", groupId)
      formData.append("file", file)
      if (caption) formData.append("caption", caption)
      if (isPublic) formData.append("is_public", "on")
      if (selectedAlbum) formData.append("albumId", selectedAlbum)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setUploading(false)
        return
      }
    }

    window.location.href = `/groups/${groupId}`
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 hover:border-primary/30 transition-all"
    >
      <input type="hidden" name="groupId" value={groupId} />

      <div className="flex flex-col items-center gap-5">
        {previews.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
            {previews.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-white/10 animate-scale-in">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={uploading}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-[10px] hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer text-gray-400 hover:text-white transition-colors group">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="rounded-2xl border-2 border-dashed border-border p-5 group-hover:border-primary/40 transition-all group-hover:bg-primary/5">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Choose photos to upload</span>
            <span className="text-xs text-gray-500">JPEG, PNG, WebP · up to 10MB each</span>
          </label>
        )}

        {albums.length > 0 && (
          <select
            name="albumId"
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full max-w-md rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          >
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}

        <input
          name="caption"
          type="text"
          placeholder="Add a caption (applies to all)..."
          className="w-full max-w-md rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />

        <label className="flex items-center gap-2.5 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
          <input type="checkbox" name="is_public" className="rounded border-border bg-surface text-primary focus:ring-primary/50" />
          Make public (visible to everyone)
        </label>

        {error && <p className="text-sm text-red-400 bg-red-950/30 px-4 py-2 rounded-xl">{error}</p>}

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </div>
        )}

        {previews.length > 0 && !uploading && (
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-2.5 text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            Upload {files.length} photo{files.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    </form>
  )
}
