"use client"

import { useState, useEffect } from "react"
import { getPendingReports, resolveReport } from "@/lib/supabase/reports"

interface ReportWithPhoto {
  id: string
  photo_id: string
  reporter_id: string
  reason: string
  created_at: string
  photo: { url: string; caption: string | null }
}

export function ReportsPanel({ groupId }: { groupId: string }) {
  const [reports, setReports] = useState<ReportWithPhoto[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await getPendingReports(groupId)
    setReports(data as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [groupId])

  if (loading) return null
  if (reports.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reports</h2>
        <span className="text-[11px] font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
          {reports.length} pending
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl bg-surface border border-border p-4 flex gap-4 items-start">
            <img src={r.photo.url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 ring-1 ring-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 line-clamp-2">{r.reason}</p>
              <p className="text-xs text-gray-500 mt-1">Reported {new Date(r.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={async () => {
                  await resolveReport(r.id, "dismissed")
                  load()
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={async () => {
                  await resolveReport(r.id, "kept")
                  load()
                }}
                className="rounded-lg bg-red-500/10 border border-red-800/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-all"
              >
                Keep removed
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
