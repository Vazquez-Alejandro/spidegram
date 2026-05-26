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

  const { photoId, groupId, action } = await request.json()

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (membership?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  if (action === "approve") {
    await supabase
      .from("photos")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", photoId)
  } else {
    await supabase
      .from("photos")
      .update({ status: "rejected" })
      .eq("id", photoId)
  }

  revalidatePath(`/groups/${groupId}`)

  return NextResponse.json({ success: true })
}
