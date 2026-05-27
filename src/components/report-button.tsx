"use client"

import { useState } from "react"
import { reportPhoto } from "@/lib/supabase/reports"

export function ReportButton({ photoId }: { photoId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim() || sending) return
    setSending(true)
    setError(null)

    const formData = new FormData()
    formData.set("reason", reason)

    try {
      await reportPhoto(photoId, formData)
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm transition-all rounded-xl px-3 py-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-950/30"
        title="Report photo"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full mx-4 ring-1 ring-border animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-3">Report submitted. A group admin will review it.</p>
                <button onClick={() => setOpen(false)} className="text-sm text-primary hover:underline">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h3 className="font-semibold">Report photo</h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you reporting this photo?"
                  required
                  rows={3}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={sending} className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    {sending ? "Sending..." : "Submit report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
