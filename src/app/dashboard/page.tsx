import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { resendVerification } from "@/lib/supabase/actions"
import { DashboardClient } from "@/components/dashboard-client"
import { NotificationPrompt } from "@/components/notification-prompt"

export const metadata: Metadata = {
  title: "My Groups — Spidegram",
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await props.searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups(*)")
    .eq("user_id", user.id) as unknown as {
    data: { group_id: string; role: string; groups: {
      id: string; name: string; description: string | null;
      cover_url: string | null; is_public: boolean;
      created_by: string;
      created_at: string; updated_at: string;
    } }[] | null
  }

  const groups = memberships?.map((m) => ({
    ...m.groups,
    role: m.role,
  })) ?? []

  const filtered = q
    ? groups.filter((g) =>
        g.name.toLowerCase().includes(q.toLowerCase()) ||
        g.description?.toLowerCase().includes(q.toLowerCase()),
      )
    : groups

  const emailNotConfirmed = !user.email_confirmed_at

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
      {emailNotConfirmed && (
        <div className="mb-6 rounded-xl bg-amber-900/40 border border-amber-800/50 px-4 py-3 text-sm text-amber-300 flex items-center justify-between gap-4 animate-scale-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Please confirm your email address to enable all features.</span>
          </div>
          <form>
            <button
              type="submit"
              formAction={resendVerification}
              className="shrink-0 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Resend
            </button>
          </form>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Groups</h1>
          <p className="text-sm text-gray-500 mt-1">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/groups/new"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Create Group
          </a>
          <a
            href="/groups/join"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-white/5 transition-all"
          >
            Join Group
          </a>
        </div>
      </div>

      <div className="mb-6">
        <NotificationPrompt />
      </div>

      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          name="q"
          type="text"
          defaultValue={q ?? ""}
          placeholder="Search groups by name..."
          form="searchForm"
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
      </div>
      <form id="searchForm" action="/dashboard" className="hidden">
        <input type="hidden" name="q" value={q ?? ""} />
      </form>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-5xl mb-4">📸</div>
          <p className="text-lg font-medium">{q ? "No groups match your search" : "No groups yet"}</p>
          <p className="mt-1 text-sm">{q ? "Try a different search term." : "Create a new group or join an existing one."}</p>
        </div>
      ) : (
        <DashboardClient groups={filtered as any} />
      )}
    </main>
  )
}
