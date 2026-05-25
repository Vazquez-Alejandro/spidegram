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

  const { error: dbError } = await supabase.from("photos").insert({
    group_id: groupId,
    uploader_id: user.id,
    url: publicUrl,
    caption: caption || null,
    is_public: isPublic,
    status: "pending",
  })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, groupId })
}
