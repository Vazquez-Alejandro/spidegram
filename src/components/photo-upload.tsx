"use client"

import { useState, useRef } from "react"

export function PhotoUpload({ groupId }: { groupId: string }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError("No file selected")
      return
    }

    const formData = new FormData()
    formData.append("groupId", groupId)
    formData.append("file", file)

    const caption = fileRef.current?.form?.querySelector<HTMLInputElement>("[name=caption]")?.value
    if (caption) formData.append("caption", caption)

    const isPublic = fileRef.current?.form?.querySelector<HTMLInputElement>("[name=is_public]")?.checked
    if (isPublic) formData.append("is_public", "on")

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      return
    }

    window.location.href = `/groups/${data.groupId}`
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-dashed border-border bg-surface/50 p-8 hover:border-primary/30 transition-all"
    >
      <input type="hidden" name="groupId" value={groupId} />

      <div className="flex flex-col items-center gap-5">
        {preview ? (
          <div className="relative w-full max-w-xs mx-auto animate-scale-in">
            <img
              src={preview}
              alt="Preview"
              className="w-full aspect-square rounded-xl object-cover ring-1 ring-white/10"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setFile(null)
                if (fileRef.current) fileRef.current.value = ""
              }}
              className="absolute top-3 right-3 rounded-full bg-black/70 p-1.5 text-sm hover:bg-black/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer text-gray-400 hover:text-white transition-colors group">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) {
                  setFile(f)
                  setPreview(URL.createObjectURL(f))
                }
              }}
              className="hidden"
            />
            <div className="rounded-2xl border-2 border-dashed border-border p-5 group-hover:border-primary/40 transition-all group-hover:bg-primary/5">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Choose a photo to upload</span>
            <span className="text-xs text-gray-500">JPEG, PNG, WebP up to 10MB</span>
          </label>
        )}

        <input
          name="caption"
          type="text"
          placeholder="Add a caption..."
          className="w-full max-w-md rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />

        <label className="flex items-center gap-2.5 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
          <input type="checkbox" name="is_public" className="rounded border-border bg-surface text-primary focus:ring-primary/50" />
          Make public (visible to everyone)
        </label>

        {error && <p className="text-sm text-red-400 bg-red-950/30 px-4 py-2 rounded-xl">{error}</p>}

        {preview && (
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-2.5 text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            Upload photo
          </button>
        )}
      </div>
    </form>
  )
}
