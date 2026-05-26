"use client"

import { removeMember, transferOwnership } from "@/lib/supabase/groups"
import { useRouter } from "next/navigation"

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

  async function handleRemove(userId: string) {
    if (!confirm("Remove this member from the group?")) return
    const fd = new FormData()
    fd.set("groupId", groupId)
    fd.set("userId", userId)
    const result = await removeMember(fd)
    if (result?.error) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  async function handleTransfer(userId: string) {
    if (!confirm("Transfer admin ownership to this member?")) return
    const fd = new FormData()
    fd.set("groupId", groupId)
    fd.set("userId", userId)
    const result = await transferOwnership(fd)
    if (result?.error) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  return (
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
                onClick={() => handleTransfer(m.user_id)}
                className="text-xs text-primary hover:text-primary-hover transition-colors font-medium"
              >
                Make admin
              </button>
              <button
                onClick={() => handleRemove(m.user_id)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
