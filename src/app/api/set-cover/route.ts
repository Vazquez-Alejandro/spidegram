import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { groupId, photoUrl } = await request.json()

  const { data: member } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await supabase.from("groups").update({ cover_url: photoUrl }).eq("id", groupId)

  revalidatePath(`/groups/${groupId}`)
  revalidatePath("/dashboard")

  return NextResponse.json({ success: true })
}
