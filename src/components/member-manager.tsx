"use client"

import { useState } from "react"
import { removeMember, transferOwnership } from "@/lib/supabase/groups"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "./confirm-modal"

type Member = {
  id: string
  user_id: string
  role: string
  name: string
}

export function MemberManager({
  groupId,
  members,
  currentUserId,
}: {
  groupId: string
  members: Member[]
  currentUserId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{
    type: "remove" | "transfer"
    userId: string
    name: string
  } | null>(null)

  async function handleRemove(userId: string) {
    setConfirmTarget(null)
    setLoading(userId)
    const fd = new FormData()
    fd.set("groupId", groupId)
    fd.set("userId", userId)
    const result = await removeMember(fd)
    if (result?.error) return
    setLoading(null)
    router.refresh()
  }

  async function handleTransfer(userId: string) {
    setConfirmTarget(null)
    setLoading(userId)
    const fd = new FormData()
    fd.set("groupId", groupId)
    fd.set("userId", userId)
    const result = await transferOwnership(fd)
    if (result?.error) return
    setLoading(null)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-gray-500 capitalize">{m.role}</p>
              </div>
            </div>
            {m.user_id !== currentUserId && (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmTarget({ type: "transfer", userId: m.user_id, name: m.name })}
                  disabled={loading === m.user_id}
                  className="text-xs text-primary hover:text-primary-hover transition-colors font-medium disabled:opacity-50"
                >
                  {loading === m.user_id ? "Transferring..." : "Make admin"}
                </button>
                <button
                  onClick={() => setConfirmTarget({ type: "remove", userId: m.user_id, name: m.name })}
                  disabled={loading === m.user_id}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <ConfirmModal
        open={confirmTarget?.type === "remove"}
        onConfirm={() => handleRemove(confirmTarget!.userId)}
        onCancel={() => setConfirmTarget(null)}
        title="Remove member?"
        message={`Remove ${confirmTarget?.name ?? "this member"} from the group?`}
        confirmLabel="Remove"
        variant="danger"
      />
      <ConfirmModal
        open={confirmTarget?.type === "transfer"}
        onConfirm={() => handleTransfer(confirmTarget!.userId)}
        onCancel={() => setConfirmTarget(null)}
        title="Transfer ownership?"
        message={`Make ${confirmTarget?.name ?? "this member"} the new admin? You will become a regular member.`}
        confirmLabel="Transfer"
        variant="primary"
      />
    </>
  )
}
