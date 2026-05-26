"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Activity = {
  id: string
  type: "photo" | "comment"
  user_name: string
  user_id: string
  description: string
  created_at: string
}

export function ActivityFeed({ groupId }: { groupId: string }) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [photosRes, commentsRes] = await Promise.all([
        supabase
          .from("photos")
          .select("id, uploader_id, caption, created_at, profiles!inner(full_name, username)")
          .eq("group_id", groupId)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("photo_comments")
          .select("id, user_id, content, created_at, photos!inner(group_id)")
          .eq("photos.group_id", groupId)
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      const photos: Activity[] = ((photosRes.data ?? []) as any[]).map((p) => ({
        id: `photo-${p.id}`,
        type: "photo" as const,
        user_name: p.profiles?.full_name || p.profiles?.username || "Someone",
        user_id: p.uploader_id,
        description: p.caption
          ? `uploaded "${p.caption.slice(0, 40)}${p.caption.length > 40 ? "…" : ""}"`
          : "uploaded a photo",
        created_at: p.created_at,
      }))

      const comments: Activity[] = ((commentsRes.data ?? []) as any[]).map((c) => ({
        id: `comment-${c.id}`,
        type: "comment" as const,
        user_name: "Someone",
        user_id: c.user_id,
        description: `commented: "${c.content.slice(0, 40)}${c.content.length > 40 ? "…" : ""}"`,
        created_at: c.created_at,
      }))

      const all = [...photos, ...comments]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)

      setActivities(all)
    }

    load()
  }, [groupId])

  if (activities.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-6">No recent activity</p>
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => (
        <div key={a.id} className="flex items-start gap-3 text-sm">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
            a.type === "photo"
              ? "bg-primary/20 text-primary"
              : "bg-accent/20 text-accent"
          }`}>
            {a.type === "photo" ? "📷" : "💬"}
          </div>
          <div className="min-w-0">
            <p className="text-gray-300 leading-relaxed">
              <span className="font-medium text-white">{a.user_name}</span>{" "}
              {a.description}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {new Date(a.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
