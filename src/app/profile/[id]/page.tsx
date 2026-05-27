import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { followUser, unfollowUser } from "@/lib/supabase/social"

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", id)
    .single()

  const name = profile?.full_name || profile?.username || "Profile"
  return { title: `${name} — Spidegram` }
}

export default async function ProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  const membershipsRes = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", id)

  const memberships = membershipsRes.data

  const { count: followersCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("following_id", id)

  const { count: followingCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", id)

  const groupIds = [...new Set(memberships?.map((m) => m.group_id) ?? [])]
  const { data: membershipGroups } = groupIds.length
    ? await supabase.from("groups").select("id, name").in("id", groupIds)
    : { data: [] }
  const membershipGroupMap = new Map(membershipGroups?.map((g) => [g.id, g.name]) ?? [])

  const isOwnProfile = user.id === id

  const { data: isFollowingRow } = !isOwnProfile
    ? await supabase
        .from("friendships")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", id)
        .maybeSingle()
    : { data: null }

  const isFollowing = !!isFollowingRow

  const { data: photos } = await supabase
    .from("photos")
    .select("id, group_id, url, caption, is_public, created_at")
    .eq("uploader_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(12)

  const { data: myGroups } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id)

  const myGroupIds = new Set(myGroups?.map((g) => g.group_id) ?? [])

  const visiblePhotos = photos?.filter(
    (p) => myGroupIds.has(p.group_id) || p.is_public,
  )

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-border mb-4" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold mb-4">
            {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "?"}
          </div>
        )}
        <h1 className="text-2xl font-bold">
          {profile.full_name || profile.username || "Anonymous"}
        </h1>
        {profile.username && profile.full_name && (
          <p className="text-sm text-gray-500">@{profile.username}</p>
        )}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="font-semibold">{memberships?.length ?? 0}</span>{" "}
            <span className="text-gray-500">groups</span>
          </div>
          <div>
            <span className="font-semibold">{followersCount ?? 0}</span>{" "}
            <span className="text-gray-500">followers</span>
          </div>
          <div>
            <span className="font-semibold">{followingCount ?? 0}</span>{" "}
            <span className="text-gray-500">following</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {isOwnProfile ? (
            <a
              href="/profile/edit"
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-white/5 transition-all"
            >
              Edit profile
            </a>
          ) : (
            <form action={isFollowing ? unfollowUser : followUser}>
              <input type="hidden" name="userId" value={id} />
              <button
                type="submit"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  isFollowing
                    ? "border border-border text-gray-400 hover:bg-white/5"
                    : "bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </form>
          )}
        </div>
      </div>

      {memberships && memberships.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Groups
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {memberships.map((m) => (
              <a
                key={m.group_id}
                href={`/groups/${m.group_id}`}
                className="rounded-xl bg-surface border border-border px-3 py-1.5 text-sm hover:border-primary/20 transition-colors"
              >
                {membershipGroupMap.get(m.group_id) ?? "Unknown"}
                {m.role === "admin" && (
                  <span className="text-primary ml-1">★</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Photos
          </h2>
          <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {visiblePhotos?.length ?? 0}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        {!visiblePhotos || visiblePhotos.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No photos yet.</p>
        ) : (
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4">
            {visiblePhotos.map((photo) => (
              <a
                key={photo.id}
                href={`/photos/${photo.id}`}
                className="aspect-square rounded-xl overflow-hidden ring-1 ring-white/5 hover:ring-primary/30 transition-all"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
