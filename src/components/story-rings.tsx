"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types"
import { getActiveStories } from "@/lib/supabase/stories"
import { StoryViewer } from "./story-viewer"
import { StoryUpload } from "./story-upload"

export function StoryRings({ groupId, userId }: { groupId: string; userId: string }) {
  const [stories, setStories] = useState<(Story & { username?: string })[]>([])
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveStories(groupId).then((data) => {
      setStories(data as any)
      setLoading(false)
    })
  }, [groupId])

  const hasUnviewed = stories.some((s) => !s.viewed)

  if (loading) return null

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <StoryUpload groupId={groupId} />

        {stories.map((story, i) => (
          <button
            key={story.id}
            onClick={() => setViewerIndex(i)}
            className="flex flex-col items-center gap-1 group shrink-0"
          >
            <div
              className={`w-16 h-16 rounded-full p-0.5 ${
                story.viewed
                  ? "ring-2 ring-border"
                  : "ring-2 ring-primary"
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white">
                {(story as any).username?.[0]?.toUpperCase() || "?"}
              </div>
            </div>
            <span className="text-[10px] text-gray-500 truncate max-w-[64px]">
              {(story as any).username?.split(" ")[0] || "User"}
            </span>
          </button>
        ))}
      </div>

      {viewerIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  )
}
