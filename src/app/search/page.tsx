import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SearchResults } from "@/components/search-results"

export const metadata: Metadata = {
  title: "Search — Spidegram",
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await props.searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  let photos: {
    id: string
    url: string
    caption: string | null
    created_at: string
    group_id: string
    uploader_id: string
  }[] = []
  let groups: { id: string; name: string; description: string | null; cover_url: string | null }[] = []
  let users: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }[] = []

  if (q?.trim()) {
    const term = q.trim()

    const { data: myGroupIds } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)

    const gids = myGroupIds?.map((g) => g.group_id) ?? []

    const [photosRes, groupsRes, usersRes] = await Promise.all([
      supabase
        .from("photos")
        .select("id, url, caption, created_at, group_id, uploader_id")
        .eq("status", "approved")
        .or(
          gids.length > 0
            ? `and(caption.ilike.%${term}%,group_id.in.(${gids.join(",")})),and(caption.ilike.%${term}%,is_public.eq.true)`
            : `caption.ilike.%${term}%,is_public.eq.true`,
        )
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("groups")
        .select("id, name, description, cover_url")
        .or(
          gids.length > 0
            ? `and(name.ilike.%${term}%,id.in.(${gids.join(",")})),and(name.ilike.%${term}%,is_public.eq.true)`
            : `name.ilike.%${term}%,is_public.eq.true`,
        )
        .limit(10),
      supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .or(`full_name.ilike.%${term}%,username.ilike.%${term}%`)
        .neq("id", user.id)
        .limit(10),
    ])

    photos = (photosRes.data ?? []) as typeof photos
    groups = (groupsRes.data ?? []) as typeof groups
    users = (usersRes.data ?? []) as typeof users
  }

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold">Search</h1>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form className="mb-8">
        <div className="relative max-w-xl">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Search photos, groups, and people..."
            autoFocus
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </form>

      <SearchResults
        query={q ?? ""}
        photos={photos}
        groups={groups}
        users={users}
      />
    </main>
  )
}
