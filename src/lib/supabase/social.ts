"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function followUser(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const followingId = formData.get("userId") as string
  if (!followingId || followingId === user.id) return

  await supabase.from("friendships").insert({
    follower_id: user.id,
    following_id: followingId,
  })

  revalidatePath("/friends")
  revalidatePath("/feed")
}

export async function unfollowUser(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const followingId = formData.get("userId") as string

  await supabase
    .from("friendships")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId)

  revalidatePath("/friends")
  revalidatePath("/feed")
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)

  revalidatePath("/notifications")
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)

  revalidatePath("/notifications")
}
