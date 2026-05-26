"use client"

import { useEffect, useState } from "react"

export function InviteLink({ groupId, origin = "" }: { groupId: string; origin?: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState(origin ? `${origin}/groups/join?id=${groupId}` : "")

  useEffect(() => {
    if (!url) {
      setUrl(`${window.location.origin}/groups/join?id=${groupId}`)
    }
  }, [groupId, url])

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      await navigator.clipboard.writeText(groupId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
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
          disabled={!url}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold hover:opacity-90 transition-all shrink-0 disabled:opacity-50"
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
