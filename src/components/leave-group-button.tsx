"use client"

import { leaveGroup } from "@/lib/supabase/groups"

export function LeaveGroupButton({ groupId }: { groupId: string }) {
  return (
    <form
      action={leaveGroup}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to leave this group?")) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="groupId" value={groupId} />
      <button
        type="submit"
        className="rounded-lg border border-red-900 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950 transition-colors"
      >
        Leave
      </button>
    </form>
  )
}
