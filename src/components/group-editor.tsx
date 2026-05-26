"use client"

import { useState } from "react"
import { updateGroup } from "@/lib/supabase/groups"
import { useRouter } from "next/navigation"

export function GroupEditor({
  groupId,
  initialName,
  initialDescription,
}: {
  groupId: string
  initialName: string
  initialDescription: string | null
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription ?? "")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const fd = new FormData()
    fd.set("groupId", groupId)
    fd.set("name", name)
    fd.set("description", description)

    const result = await updateGroup(fd)
    if (result?.error) {
      setError(result.error)
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-all"
      >
        Edit group
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Edit group</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-name" className="text-sm text-gray-400 font-medium">Group name</label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-desc" className="text-sm text-gray-400 font-medium">Description</label>
                <textarea
                  id="edit-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
