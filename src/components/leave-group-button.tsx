"use client"

import { useState } from "react"
import { leaveGroup } from "@/lib/supabase/groups"
import { ConfirmModal } from "./confirm-modal"

export function LeaveGroupButton({ groupId }: { groupId: string }) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-xl border border-red-900/50 text-red-400 px-4 py-2.5 text-sm font-medium hover:bg-red-950/50 transition-all hover:border-red-700"
      >
        Leave group
      </button>
      <ConfirmModal
        open={showConfirm}
        onConfirm={() => {
          setShowConfirm(false)
          const fd = new FormData()
          fd.set("groupId", groupId)
          leaveGroup(fd)
        }}
        onCancel={() => setShowConfirm(false)}
        title="Leave group?"
        message="You'll lose access to all photos in this group."
        confirmLabel="Leave"
        variant="danger"
      />
    </>
  )
}
