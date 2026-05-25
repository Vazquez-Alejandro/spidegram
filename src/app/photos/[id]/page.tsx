import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addComment, toggleReaction } from "@/lib/supabase/photos"

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

  const canView =
    photo.status === "approved" &&
    (photo.is_public ||
      (await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", photo.group_id)
        .eq("user_id", user.id)
        .maybeSingle())?.data)

  if (!canView) redirect("/dashboard")

  const { data: comments } = await supabase
    .from("photo_comments")
    .select("*, profiles(username, full_name, avatar_url)")
    .eq("photo_id", id)
    .order("created_at", { ascending: true })

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
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
      <a
        href={`/groups/${photo.group_id}`}
        className="text-sm text-gray-400 hover:text-white transition-colors mb-6 inline-block"
      >
        ← Back to {photo.groups?.name || "group"}
      </a>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl overflow-hidden bg-gray-900">
          <img
            src={photo.url}
            alt={photo.caption ?? ""}
            className="w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          {photo.caption && (
            <p className="text-lg">{photo.caption}</p>
          )}

          <div className="flex items-center gap-4">
            <form action={toggleReaction.bind(null, photo.id)}>
              <button
                type="submit"
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  userReaction
                    ? "text-primary"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill={userReaction ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {reactions?.length ?? 0}
              </button>
            </form>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold mb-3">
              Comments ({comments?.length ?? 0})
            </h3>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {!comments || comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium text-primary">
                      {c.profiles?.full_name || c.profiles?.username || "Anon"}
                    </span>
                    <span className="text-gray-300 ml-2">{c.content}</span>
                  </div>
                ))
              )}
            </div>
            <form action={addComment.bind(null, photo.id)} className="flex gap-2">
              <input
                name="content"
                type="text"
                required
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
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
