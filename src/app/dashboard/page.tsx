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
        <h1 className="text-2xl font-bold">My Groups</h1>
        <div className="flex gap-3">
          <a
            href="/groups/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Create Group
          </a>
          <a
            href="/groups/join"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Join Group
          </a>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">You haven&apos;t joined any groups yet.</p>
          <p className="mt-2">Create a new group or join an existing one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`/groups/${group.id}`}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-lg">{group.name}</h2>
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {group.role}
                </span>
              </div>
              {group.description && (
                <p className="text-sm text-gray-400 line-clamp-2">{group.description}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
