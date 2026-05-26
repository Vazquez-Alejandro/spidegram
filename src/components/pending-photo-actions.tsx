"use client"

import { approvePhoto, rejectPhoto } from "@/lib/supabase/photos"

export function PendingPhotoActions({
  photoId,
  groupId,
}: {
  photoId: string
  groupId: string
}) {
  async function handleApprove() {
    const result = await approvePhoto(photoId, groupId)
    if (result?.error) {
      alert("Error approving: " + result.error)
      return
    }
    window.location.reload()
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this photo?")) return
    const result = await rejectPhoto(photoId, groupId)
    if (result?.error) {
      alert("Error rejecting: " + result.error)
      return
    }
    window.location.reload()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        className="flex items-center gap-1 rounded-xl bg-emerald-600/20 text-emerald-400 px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-600/30 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Approve
      </button>
      <button
        onClick={handleReject}
        className="flex items-center gap-1 rounded-xl bg-red-600/20 text-red-400 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-600/30 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Reject
      </button>
    </div>
  )
}
