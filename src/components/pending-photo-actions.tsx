"use client"

import { useRouter } from "next/navigation"
import { approvePhoto, rejectPhoto } from "@/lib/supabase/photos"

export function PendingPhotoActions({ photoId }: { photoId: string }) {
  const router = useRouter()

  async function handleApprove() {
    await approvePhoto(photoId)
    router.refresh()
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this photo?")) return
    await rejectPhoto(photoId)
    router.refresh()
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
