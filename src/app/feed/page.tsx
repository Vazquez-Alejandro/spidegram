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
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      {photos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Your feed is empty.</p>
          <p className="mt-2">
            Follow people or join groups to see photos here.
          </p>
          <a
            href="/friends"
            className="inline-block mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Find people to follow
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {photos.map((photo) => {
            const profile = profileMap.get(photo.uploader_id)
            const group = groupMap.get(photo.group_id)
            return (
              <a
                key={photo.id}
                href={`/photos/${photo.id}`}
                className="block rounded-xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-gray-700 transition-colors"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full max-h-[600px] object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                        {profile?.full_name?.charAt(0) ||
                          profile?.username?.charAt(0) ||
                          "?"}
                      </div>
                      <span className="text-sm font-medium">
                        {profile?.full_name || profile?.username || "Unknown"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {group?.name}
                    </span>
                  </div>
                  {photo.caption && (
                    <p className="text-sm text-gray-300">{photo.caption}</p>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}
