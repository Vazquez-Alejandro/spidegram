"use client"

import { useRef, useState } from "react"
import { uploadPhoto } from "@/lib/supabase/photos"

export function PhotoUpload({ groupId }: { groupId: string }) {
  const [preview, setPreview] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form
      ref={formRef}
      action={uploadPhoto.bind(null, groupId)}
      className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-6"
    >
      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                formRef.current?.reset()
              }}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              onChange={handleFileChange}
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
          <input
            type="checkbox"
            name="is_public"
            className="rounded border-gray-700 bg-transparent"
          />
          Make public (visible to everyone)
        </label>

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
