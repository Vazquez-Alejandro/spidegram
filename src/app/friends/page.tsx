import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { followUser, unfollowUser } from "@/lib/supabase/social"

export const metadata: Metadata = {
  title: "Friends — Spidegram",
}

export default async function FriendsPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await props.searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: following } = await supabase
    .from("friendships")
    .select("following_id")
    .eq("follower_id", user.id)

  const followingIds = new Set(following?.map((f) => f.following_id) ?? [])

  const { data: followers } = await supabase
    .from("friendships")
    .select("follower_id, profiles!inner(username, full_name)")
    .eq("following_id", user.id)

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", user.id)
    .order("full_name", { ascending: true })

  const searchResults = q
    ? profiles?.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          p.username?.toLowerCase().includes(q.toLowerCase()),
      )
    : null

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold">Friends</h1>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form className="mb-8">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Search people by name or username..."
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </form>

      {searchResults && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Results</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No users found.</p>
            ) : (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold shrink-0">
                      {p.full_name?.charAt(0) || p.username?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.full_name || p.username || "Anon"}
                      </p>
                      {p.username && p.full_name && (
                        <p className="text-xs text-gray-500 truncate">@{p.username}</p>
                      )}
                    </div>
                  </div>
                  <form
                    action={
                      followingIds.has(p.id) ? unfollowUser : followUser
                    }
                  >
                    <input type="hidden" name="userId" value={p.id} />
                    <button
                      type="submit"
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 ${
                        followingIds.has(p.id)
                          ? "border border-border text-gray-400 hover:bg-white/5"
                          : "bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20"
                      }`}
                    >
                      {followingIds.has(p.id) ? "Following" : "Follow"}
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Following</h2>
          <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {following?.length ?? 0}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        {!following || following.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            You aren&apos;t following anyone yet. Search for people above.
          </p>
        ) : (
          <div className="space-y-2">
            {following
              .filter((f) => profiles?.find((p) => p.id === f.following_id))
              .map((f) => {
                const p = profiles!.find((pp) => pp.id === f.following_id)!
                return (
                  <div
                    key={f.following_id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold shrink-0">
                        {p.full_name?.charAt(0) ||
                          p.username?.charAt(0) ||
                          "?"}
                      </div>
                      <p className="text-sm font-medium">
                        {p.full_name || p.username || "Anon"}
                      </p>
                    </div>
                    <form action={unfollowUser}>
                      <input type="hidden" name="userId" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/5 transition-all shrink-0"
                      >
                        Unfollow
                      </button>
                    </form>
                  </div>
                )
              })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Followers</h2>
          <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {followers?.length ?? 0}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        {!followers || followers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No followers yet.</p>
        ) : (
          <div className="space-y-2">
            {followers.map((f) => (
              <div
                key={f.follower_id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold shrink-0">
                  {(f.profiles as unknown as { username: string | null; full_name: string | null })?.full_name?.charAt(0) ||
                    (f.profiles as unknown as { username: string | null; full_name: string | null })?.username?.charAt(0) ||
                    "?"}
                </div>
                <p className="text-sm font-medium">
                  {(f.profiles as unknown as { username: string | null; full_name: string | null })?.full_name ||
                    (f.profiles as unknown as { username: string | null; full_name: string | null })?.username ||
                    "Anon"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
