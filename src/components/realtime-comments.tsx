"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PhotoComment } from "@/types"

interface RealtimeCommentsProps {
  photoId: string
  initialComments: PhotoComment[]
  initialProfiles: Record<string, { username: string | null; full_name: string | null }>
}

export function RealtimeComments({ photoId, initialComments, initialProfiles }: RealtimeCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [profiles, setProfiles] = useState(initialProfiles)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`comments:${photoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "photo_comments",
          filter: `photo_id=eq.${photoId}`,
        },
        async (payload) => {
          const newComment = payload.new as PhotoComment
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev
            return [...prev, newComment]
          })
          if (!profiles[newComment.user_id]) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("id", newComment.user_id)
              .single()
            if (profile) {
              setProfiles((prev) => ({
                ...prev,
                [newComment.user_id]: {
                  username: profile.username,
                  full_name: profile.full_name,
                },
              }))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [photoId, profiles])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || posting) return
    setPosting(true)

    const supabase = createClient()
    const { error } = await supabase.from("photo_comments").insert({
      photo_id: photoId,
      content: content.trim(),
    })

    if (!error) {
      setContent("")
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
      }, 100)
    }
    setPosting(false)
  }

  const sorted = [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Comments</h3>
        <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div ref={listRef} className="space-y-3 mb-4 max-h-80 overflow-y-auto flex-1">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          sorted.map((c) => {
            const profile = profiles[c.user_id]
            const name = profile?.full_name || profile?.username || "Anon"
            const initial = name.charAt(0).toUpperCase()
            return (
              <div key={c.id} className="text-sm flex items-start gap-2 animate-fade-in">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  {initial}
                </div>
                <div>
                  <span className="font-medium text-white">{name}</span>
                  <span className="text-gray-300 ml-1.5">{c.content}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <input
          name="content"
          type="text"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        <button
          type="submit"
          disabled={posting}
          className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shrink-0 disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  )
}
