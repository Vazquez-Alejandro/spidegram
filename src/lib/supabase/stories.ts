"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Story } from "@/types"

export async function uploadStory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const file = formData.get("file") as File
  const groupId = formData.get("group_id") as string
  const caption = (formData.get("caption") as string) || null

  if (!file || !groupId) throw new Error("Missing required fields")

  const ext = file.name.split(".").pop() || "jpg"
  const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("stories")
    .upload(filePath, file, { contentType: file.type })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from("stories")
    .getPublicUrl(filePath)

  const mediaType = file.type.startsWith("video") ? "video" : "photo"

  const { error: dbError } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      group_id: groupId,
      media_url: publicUrl,
      media_type: mediaType,
      caption,
    })

  if (dbError) throw new Error(dbError.message)

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function deleteStory(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function viewStory(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  await supabase
    .from("story_views")
    .upsert(
      { story_id: storyId, user_id: user.id },
      { onConflict: "story_id,user_id" }
    )
    .throwOnError()

  return { success: true }
}

export async function getActiveStories(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: stories } = await supabase
    .rpc("get_active_stories", { group_id: groupId, viewer_id: user.id })
    .returns<Story[]>()

  return stories ?? []
}
