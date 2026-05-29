import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedClient } from "@/components/feed-client"
import { NotificationPrompt } from "@/components/notification-prompt"
import { getTranslations } from "@/lib/i18n/server"

export const metadata: Metadata = {
  title: "Feed — Spidegram",
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { t } = await getTranslations()

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

  const data = { photos, profileMap, groupMap } as {
    photos: FlatPhoto[]
    profileMap: Map<string, { id: string; username: string | null; full_name: string | null }>
    groupMap: Map<string, { id: string; name: string }>
  }

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <div className="mb-6">
        <NotificationPrompt />
      </div>
      <FeedClient data={data} />
    </main>
  )
}
