import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: following } = await supabase
    .from("friendships")
    .select("following_id")
    .eq("follower_id", user.id)

  const followingIds = following?.map((f) => f.following_id) ?? []

  const { data: myGroups } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id)

  const myGroupIds = myGroups?.map((g) => g.group_id) ?? []

  type FlatPhoto = {
    id: string
    url: string
    caption: string | null
    is_public: boolean
    created_at: string
    uploader_id: string
    group_id: string
  }

  let photos: FlatPhoto[] = []

  if (followingIds.length > 0 || myGroupIds.length > 0) {
    const query = supabase
      .from("photos")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50)

    if (followingIds.length > 0 && myGroupIds.length > 0) {
      query.or(
        `and(is_public.eq.true,uploader_id.in.(${followingIds.join(",")})),` +
          `group_id.in.(${myGroupIds.join(",")})`,
      )
    } else if (followingIds.length > 0) {
      query.in("uploader_id", followingIds).eq("is_public", true)
    } else if (myGroupIds.length > 0) {
      query.in("group_id", myGroupIds)
    }

    const { data } = await query
    photos = (data ?? []) as FlatPhoto[]
  }

  const allUserIds = [...new Set(photos.map((p) => p.uploader_id))]
  const allGroupIds = [...new Set(photos.map((p) => p.group_id))]

  const [{ data: profiles }, { data: groups }] = await Promise.all([
    allUserIds.length
      ? supabase.from("profiles").select("id, username, full_name").in("id", allUserIds)
      : { data: [] },
    allGroupIds.length
      ? supabase.from("groups").select("id, name").in("id", allGroupIds)
      : { data: [] },
  ])

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])
  const groupMap = new Map(groups?.map((g) => [g.id, g]) ?? [])

  return (
    <main className="flex-1 mx-auto max-w-xl w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold">Feed</h1>
        <div className="h-px flex-1 bg-border" />
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-5xl mb-4">📰</div>
          <p className="text-lg font-medium">Your feed is empty</p>
          <p className="mt-1 text-sm text-center max-w-xs">
            Follow people or join groups to see photos here.
          </p>
          <a
            href="/friends"
            className="mt-6 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Find people to follow
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {photos.map((photo) => {
            const profile = profileMap.get(photo.uploader_id)
            const group = groupMap.get(photo.group_id)
            return (
              <div
                key={photo.id}
                className="rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold shrink-0">
                    {profile?.full_name?.charAt(0) ||
                      profile?.username?.charAt(0) ||
                      "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.full_name || profile?.username || "Unknown"}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                    {group?.name}
                  </span>
                </div>
                <a href={`/photos/${photo.id}`}>
                  <img
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    className="w-full max-h-[600px] object-cover"
                  />
                </a>
                <div className="px-4 py-3 space-y-1.5">
                  {photo.caption && (
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <span className="font-medium text-white">
                        {profile?.full_name || profile?.username || "Unknown"}
                      </span>{" "}
                      {photo.caption}
                    </p>
                  )}
                  <a
                    href={`/photos/${photo.id}`}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors block"
                  >
                    View details →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
