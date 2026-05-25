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
      className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-6"
    >
      <input type="hidden" name="groupId" value={groupId} />

      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <div className="relative w-full max-w-xs">
            <img
              src={preview}
              alt="Preview"
              className="w-full aspect-square rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setFile(null)
                if (fileRef.current) fileRef.current.value = ""
              }}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
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
            <div className="rounded-full border border-gray-700 p-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm">Choose a photo to upload</span>
          </label>
        )}

        <input
          name="caption"
          type="text"
          placeholder="Add a caption..."
          className="w-full rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" name="is_public" className="rounded border-gray-700 bg-transparent" />
          Make public (visible to everyone)
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {preview && (
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Upload photo
          </button>
        )}
      </div>
    </form>
  )
}
