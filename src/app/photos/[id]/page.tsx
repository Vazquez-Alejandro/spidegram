import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { toggleReaction, deletePhoto } from "@/lib/supabase/photos"
import { EditCaption } from "@/components/edit-caption"
import { SharePhoto } from "@/components/share-photo"
import { RealtimeComments } from "@/components/realtime-comments"

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: photo } = await supabase
    .from("photos")
    .select("caption")
    .eq("id", id)
    .single()

  return {
    title: photo?.caption
      ? `${photo.caption.slice(0, 50)} — Spidegram`
      : "Photo — Spidegram",
  }
}

export default async function PhotoPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: photo } = await supabase
    .from("photos")
    .select("*, groups(name)")
    .eq("id", id)
    .single()

  if (!photo) redirect("/dashboard")

  const { data: userMembership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", photo.group_id)
    .eq("user_id", user.id)
    .maybeSingle()

  const canView =
    photo.status === "approved" && (photo.is_public || userMembership)

  if (!canView) redirect("/dashboard")

  const canDelete =
    photo.uploader_id === user.id || userMembership?.role === "admin"

  const { data: rawComments } = await supabase
    .from("photo_comments")
    .select("*")
    .eq("photo_id", id)
    .order("created_at", { ascending: true })

  const comments = rawComments ?? []

  const commentUserIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: commentProfiles } = commentUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", commentUserIds)
    : { data: [] }

  const profileMap = new Map(commentProfiles?.map((p) => [p.id, p]) ?? [])

  const { data: reactions } = await supabase
    .from("reactions")
    .select("user_id")
    .eq("photo_id", id)

  const { data: userReaction } = await supabase
    .from("reactions")
    .select("id")
    .eq("photo_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  const { data: prevPhoto } = await supabase
    .from("photos")
    .select("id")
    .eq("group_id", photo.group_id)
    .eq("status", "approved")
    .lt("created_at", photo.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: nextPhoto } = await supabase
    .from("photos")
    .select("id")
    .eq("group_id", photo.group_id)
    .eq("status", "approved")
    .gt("created_at", photo.created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <a
          href={`/groups/${photo.group_id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {photo.groups?.name || "group"}
        </a>
        <div className="flex items-center gap-2">
          {prevPhoto && (
            <a
              href={`/photos/${prevPhoto.id}`}
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-primary/30 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </a>
          )}
          {nextPhoto && (
            <a
              href={`/photos/${nextPhoto.id}`}
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:border-primary/30 transition-all"
            >
              Next
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-0 md:gap-8">
        <div className="md:col-span-3 rounded-2xl overflow-hidden bg-surface ring-1 ring-white/5">
          <img
            src={photo.url}
            alt={photo.caption ?? ""}
            className="w-full object-cover"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-5 mt-4 md:mt-0">
          {photo.uploader_id === user.id ? (
            <EditCaption photoId={photo.id} groupId={photo.group_id} initialCaption={photo.caption} />
          ) : photo.caption ? (
            <p className="text-base leading-relaxed">{photo.caption}</p>
          ) : null}

          <div className="flex items-center gap-4">
            <form action={toggleReaction.bind(null, photo.id)}>
              <button
                type="submit"
                className={`flex items-center gap-1.5 text-sm transition-all rounded-xl px-3 py-1.5 ${
                  userReaction
                    ? "text-accent bg-accent/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-5 h-5" fill={userReaction ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {reactions?.length ?? 0} {reactions?.length === 1 ? "like" : "likes"}
              </button>
            </form>
            <SharePhoto photoId={photo.id} />
            <a
              href={photo.url}
              download
              className="flex items-center gap-1.5 text-sm transition-all rounded-xl px-3 py-1.5 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </a>
            {canDelete && (
              <form action={deletePhoto.bind(null, photo.id, photo.group_id)}>
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm("Delete this photo permanently?")) e.preventDefault()
                  }}
                  className="flex items-center gap-1.5 text-sm transition-all rounded-xl px-3 py-1.5 text-red-400 hover:bg-red-950/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </form>
            )}
          </div>

          <RealtimeComments
            photoId={photo.id}
            initialComments={comments}
            initialProfiles={Object.fromEntries(
              [...profileMap.entries()].map(([id, p]) => [id, { username: p.username, full_name: p.full_name }])
            )}
          />
        </div>
      </div>
    </main>
  )
}
