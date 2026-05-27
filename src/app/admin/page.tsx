import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAdminStats } from "@/lib/supabase/admin"

export const metadata: Metadata = {
  title: "Admin — Spidegram",
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: isAdmin } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!isAdmin) redirect("/dashboard")

  const stats = await getAdminStats()

  const cards = [
    { label: "Users", value: stats.users, color: "from-blue-500 to-blue-600" },
    { label: "Groups", value: stats.groups, color: "from-green-500 to-green-600" },
    { label: "Photos", value: stats.photos, color: "from-purple-500 to-purple-600" },
    { label: "Albums", value: stats.albums, color: "from-pink-500 to-pink-600" },
    { label: "Active Stories", value: stats.activeStories, color: "from-orange-500 to-orange-600" },
    { label: "Pending Reports", value: stats.pendingReports, color: "from-red-500 to-red-600" },
  ]

  return (
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="text-gray-400 mt-1">Global platform statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-surface border border-border p-5 hover:border-primary/20 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <span className="text-lg font-bold text-white">{card.value}</span>
            </div>
            <p className="text-sm text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-surface border border-border p-5">
        <h2 className="font-semibold mb-2">Become a super admin</h2>
        <p className="text-sm text-gray-400">
          To make yourself a super admin, run this SQL in your Supabase SQL editor:
        </p>
        <pre className="mt-2 rounded-xl bg-background p-4 text-xs text-gray-300 overflow-x-auto">
          insert into super_admins (user_id) values (&apos;{user.id}&apos;);
        </pre>
      </div>
    </main>
  )
}
