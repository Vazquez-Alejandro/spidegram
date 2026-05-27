"use client"

import { useState } from "react"

export function InviteLink({ groupId, origin }: { groupId: string; origin: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${origin}/groups/join?id=${groupId}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      await navigator.clipboard.writeText(groupId)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-4" suppressHydrationWarning>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Invite link
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-gray-400 truncate focus:outline-none"
        />
        <button
          onClick={copy}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold hover:opacity-90 transition-all shrink-0"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 mt-2">
        Anyone with this link can join the group
      </p>
    </div>
  )
}
