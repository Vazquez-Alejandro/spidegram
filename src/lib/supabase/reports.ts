"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function reportPhoto(photoId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const reason = formData.get("reason") as string
  if (!reason?.trim()) throw new Error("Reason is required")

  const { error } = await supabase.from("reports").insert({
    photo_id: photoId,
    reporter_id: user.id,
    reason: reason.trim(),
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/photos/${photoId}`)
  return { success: true }
}

export async function resolveReport(reportId: string, resolution: "kept" | "dismissed") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("reports")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution,
    })
    .eq("id", reportId)

  if (error) throw new Error(error.message)
  revalidatePath("/groups/[id]", "layout")
  return { success: true }
}

export async function getPendingReports(groupId: string) {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      *,
      photo:photos!inner(id, url, caption, group_id)
    `)
    .eq("photo.group_id", groupId)
    .is("resolved_at", null)
    .order("created_at", { ascending: false })

  return reports ?? []
}
