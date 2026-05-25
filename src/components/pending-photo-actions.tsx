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
    await approvePhoto(photoId, groupId)
    window.location.reload()
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this photo?")) return
    await rejectPhoto(photoId, groupId)
    window.location.reload()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        className="rounded-lg bg-green-700 px-3 py-1 text-xs font-medium hover:bg-green-600 transition-colors"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        className="rounded-lg bg-red-800 px-3 py-1 text-xs font-medium hover:bg-red-700 transition-colors"
      >
        Reject
      </button>
    </div>
  )
}
