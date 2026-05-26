"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approvePhoto, rejectPhoto } from "@/lib/supabase/photos"
import { ConfirmModal } from "./confirm-modal"

export function PendingPhotoActions({
  photoId,
  groupId,
}: {
  photoId: string
  groupId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmReject, setConfirmReject] = useState(false)

  async function handleApprove() {
    setLoading("approve")
    const result = await approvePhoto(photoId, groupId)
    if (result?.error) return
    setLoading(null)
    router.refresh()
  }

  async function handleReject() {
    setConfirmReject(false)
    setLoading("reject")
    const result = await rejectPhoto(photoId, groupId)
    if (result?.error) return
    setLoading(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={!!loading}
          className="flex items-center gap-1 rounded-xl bg-emerald-600/20 text-emerald-400 px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-600/30 transition-all disabled:opacity-50"
        >
          {loading === "approve" ? (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={() => setConfirmReject(true)}
          disabled={!!loading}
          className="flex items-center gap-1 rounded-xl bg-red-600/20 text-red-400 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-600/30 transition-all disabled:opacity-50"
        >
          {loading === "reject" ? (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>
      <ConfirmModal
        open={confirmReject}
        onConfirm={handleReject}
        onCancel={() => setConfirmReject(false)}
        title="Reject photo?"
        message="This photo will be removed and the uploader will be notified."
        confirmLabel="Reject"
        variant="danger"
      />
    </>
  )
}
