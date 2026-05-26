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

  const { photoId, groupId, caption } = await request.json()

  const { data: photo } = await supabase
    .from("photos")
    .select("uploader_id")
    .eq("id", photoId)
    .single()

  if (!photo || photo.uploader_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await supabase
    .from("photos")
    .update({ caption: caption || null })
    .eq("id", photoId)

  revalidatePath(`/photos/${photoId}`)
  revalidatePath(`/groups/${groupId}`)

  return NextResponse.json({ success: true })
}
