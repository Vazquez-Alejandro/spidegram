import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { followUser, unfollowUser } from "@/lib/supabase/social"

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
      <h1 className="text-2xl font-bold mb-6">Friends</h1>

      <form className="mb-8">
        <div className="flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Search people by name or username..."
            className="flex-1 rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {searchResults && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Search Results
          </h2>
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary font-medium">
                      {p.full_name?.charAt(0) || p.username?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {p.full_name || p.username || "Anon"}
                      </p>
                      {p.username && p.full_name && (
                        <p className="text-xs text-gray-500">@{p.username}</p>
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
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        followingIds.has(p.id)
                          ? "border border-gray-700 text-gray-400 hover:bg-gray-800"
                          : "bg-primary hover:bg-primary-hover"
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
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Following ({following?.length ?? 0})
        </h2>
        {!following || following.length === 0 ? (
          <p className="text-sm text-gray-500">
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
                    className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary font-medium">
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
                        className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 transition-colors"
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
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Followers ({followers?.length ?? 0})
        </h2>
        {!followers || followers.length === 0 ? (
          <p className="text-sm text-gray-500">No followers yet.</p>
        ) : (
          <div className="space-y-2">
            {followers.map((f) => (
              <div
                key={f.follower_id}
                className="flex items-center gap-3 rounded-lg border border-gray-800 px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
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
