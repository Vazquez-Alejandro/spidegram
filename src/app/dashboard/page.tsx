import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
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
      cover_url: string | null; created_by: string;
      created_at: string; updated_at: string;
    } }[] | null
  }

  const groups = memberships?.map((m) => ({
    ...m.groups,
    role: m.role,
  })) ?? []

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
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

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-5xl mb-4">📸</div>
          <p className="text-lg font-medium">No groups yet</p>
          <p className="mt-1 text-sm">Create a new group or join an existing one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, i) => (
            <a
              key={group.id}
              href={`/groups/${group.id}`}
              className="group rounded-2xl border border-border bg-surface hover:border-primary/30 hover:bg-surface/80 transition-all hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="h-32 rounded-t-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-surface flex items-center justify-center">
                <span className="text-4xl opacity-50 group-hover:opacity-75 transition-opacity">
                  🕸️
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-base truncate">{group.name}</h2>
                  <span className="shrink-0 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize ml-2">
                    {group.role === "admin" ? "👑 " : ""}{group.role}
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{group.description}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
