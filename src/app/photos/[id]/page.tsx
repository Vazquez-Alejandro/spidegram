import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addComment, toggleReaction, deletePhoto } from "@/lib/supabase/photos"

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

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
      <a
        href={`/groups/${photo.group_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {photo.groups?.name || "group"}
      </a>

      <div className="grid md:grid-cols-5 gap-0 md:gap-8">
        <div className="md:col-span-3 rounded-2xl overflow-hidden bg-surface ring-1 ring-white/5">
          <img
            src={photo.url}
            alt={photo.caption ?? ""}
            className="w-full object-cover"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-5 mt-4 md:mt-0">
          {photo.caption && (
            <p className="text-base leading-relaxed">{photo.caption}</p>
          )}

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
            {canDelete && (
              <form
                action={deletePhoto.bind(null, photo.id, photo.group_id)}
                onSubmit={(e) => {
                  if (!confirm("Delete this photo permanently?")) e.preventDefault()
                }}
              >
                <button
                  type="submit"
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

          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Comments</h3>
              <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {comments.length}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto flex-1">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-sm flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                      {profileMap.get(c.user_id)?.full_name?.charAt(0) ||
                        profileMap.get(c.user_id)?.username?.charAt(0) ||
                        "?"}
                    </div>
                    <div>
                      <span className="font-medium text-white">
                        {profileMap.get(c.user_id)?.full_name ||
                          profileMap.get(c.user_id)?.username ||
                          "Anon"}
                      </span>
                      <span className="text-gray-300 ml-1.5">{c.content}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form action={addComment.bind(null, photo.id)} className="flex gap-2 mt-auto">
              <input
                name="content"
                type="text"
                required
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shrink-0"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
