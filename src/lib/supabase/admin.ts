"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: isAdmin } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!isAdmin) throw new Error("Not authorized")

  const [users, groups, photos, albums, stories, reports] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase.from("photos").select("status", { count: "exact", head: true }),
    supabase.from("albums").select("*", { count: "exact", head: true }),
    supabase.from("stories").select("*", { count: "exact", head: true }).gt("expires_at", new Date().toISOString()),
    supabase.from("reports").select("*", { count: "exact", head: true }).is("resolved_at", null),
  ])

  return {
    users: users.count ?? 0,
    groups: groups.count ?? 0,
    photos: photos.count ?? 0,
    albums: albums.count ?? 0,
    activeStories: stories.count ?? 0,
    pendingReports: reports.count ?? 0,
  }
}
