"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function uploadPhoto(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const groupId = formData.get("groupId") as string
  const file = formData.get("file") as File
  const caption = formData.get("caption") as string
  const isPublic = formData.get("is_public") === "on"

  if (!file || file.size === 0) {
    return { error: "No file selected" }
  }

  const ext = file.name.split(".").pop()
  const filePath = `${groupId}/${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file)

  if (uploadError) {
    return { error: uploadError.message }
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
    return { error: dbError.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true, groupId }
}

export async function approvePhoto(photoId: string, groupId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("photos")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", photoId)

  if (error) return { error: error.message }

  if (groupId) revalidatePath(`/groups/${groupId}`)
}

export async function rejectPhoto(photoId: string, groupId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("photos")
    .update({ status: "rejected" })
    .eq("id", photoId)

  if (error) return { error: error.message }

  if (groupId) revalidatePath(`/groups/${groupId}`)
}

export async function addComment(photoId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const content = formData.get("content") as string
  if (!content?.trim()) return

  await supabase.from("photo_comments").insert({
    photo_id: photoId,
    user_id: user.id,
    content: content.trim(),
  })

  revalidatePath(`/photos/${photoId}`)
  revalidatePath("/groups/[id]", "layout")
}

export async function toggleReaction(photoId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("photo_id", photoId)
    .eq("user_id", user.id)
    .single()

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id)
  } else {
    await supabase.from("reactions").insert({
      photo_id: photoId,
      user_id: user.id,
    })
  }

  revalidatePath(`/photos/${photoId}`)
}
