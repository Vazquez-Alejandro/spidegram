"use client"

import { useState, useEffect, useCallback } from "react"
import type { Story } from "@/types"
import { viewStory } from "@/lib/supabase/stories"

interface StoryViewerProps {
  stories: (Story & { username?: string })[]
  initialIndex: number
  onClose: () => void
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  const story = stories[current]

  const goNext = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent((i) => i + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [current, stories.length, onClose])

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((i) => i - 1)
      setProgress(0)
    }
  }, [current])

  useEffect(() => {
    if (story && story.id) {
      viewStory(story.id).catch(() => {})
    }
  }, [story])

  useEffect(() => {
    if (paused) return
    const duration = story?.media_type === "video" ? 15000 : 5000
    const interval = 30
    const step = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + step
        if (next >= 100) {
          goNext()
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [current, paused, goNext, story])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, goNext, goPrev])

  if (!story) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        if (x < rect.width * 0.33) {
          goPrev()
        } else if (x > rect.width * 0.66) {
          goNext()
        }
      }}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {stories.map((_, i) => (
          <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
              style={{
                width: i === current ? `${progress}%` : i < current ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
            {(story as any).username?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-sm font-medium text-white">
            {(story as any).username || "User"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Media */}
      <div className="max-h-[80vh] max-w-[90vw]">
        {story.media_type === "video" ? (
          <video src={story.media_url} autoPlay muted loop className="max-h-[80vh] max-w-full rounded-xl" />
        ) : (
          <img src={story.media_url} alt="" className="max-h-[80vh] max-w-full rounded-xl object-contain" />
        )}
      </div>

      {/* Caption */}
      {story.caption && (
        <div className="absolute bottom-8 left-0 right-0 text-center px-4">
          <p className="text-sm text-white/80 bg-black/40 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
            {story.caption}
          </p>
        </div>
      )}
    </div>
  )
}
