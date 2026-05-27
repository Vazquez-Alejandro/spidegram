import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const formData = await request.formData()
  const groupId = formData.get("groupId") as string
  const file = formData.get("file") as File
  const caption = formData.get("caption") as string
  const isPublic = formData.get("is_public") === "on"
  const albumId = formData.get("albumId") as string | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file selected" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()
  const filePath = `${groupId}/${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(filePath)

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  const isAdmin = membership?.role === "admin"

  const { error: dbError } = await supabase.from("photos").insert({
    group_id: groupId,
    album_id: albumId || null,
    uploader_id: user.id,
    url: publicUrl,
    caption: caption || null,
    is_public: isPublic,
    status: isAdmin ? "approved" : "pending",
    approved_by: isAdmin ? user.id : null,
    approved_at: isAdmin ? new Date().toISOString() : null,
  })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, groupId })
}
