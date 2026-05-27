"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { redirectWithFlash } from "@/lib/flash"

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const isPublic = formData.get("is_public") === "on"
  const cover = formData.get("cover") as File

  let cover_url: string | null = null
  if (cover && cover.size > 0) {
    const ext = cover.name.split(".").pop()
    const coverPath = `covers/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(coverPath, cover)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(coverPath)
      cover_url = publicUrl
    }
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, description, created_by: user.id, is_public: isPublic, cover_url })
    .select()
    .single()

  if (error) redirect(`/auth/error?message=${encodeURIComponent(error.message)}`)

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
  })

  if (memberError) redirect(`/auth/error?message=${encodeURIComponent(memberError.message)}`)

  revalidatePath("/dashboard")
  redirectWithFlash(`/groups/${group.id}`, "success", "Group created!")
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const groupId = formData.get("groupId") as string

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: user.id,
    role: "member",
  })

  if (error) redirectWithFlash(`/groups/join`, "error", error.message)

  revalidatePath("/dashboard")
  revalidatePath(`/groups/${groupId}`)
  redirectWithFlash(`/groups/${groupId}`, "success", "Joined the group!")
}

export async function leaveGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const groupId = formData.get("groupId") as string

  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id)

  revalidatePath("/dashboard")
  redirectWithFlash("/dashboard", "success", "Left the group")
}

export async function updateGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const groupId = formData.get("groupId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const { data: adminCheck } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single()

  if (!adminCheck) return { error: "Not authorized" }

  const updates: Record<string, string> = {}
  if (name?.trim()) updates.name = name.trim()
  if (description !== undefined) updates.description = description.trim() || ""

  const { error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId)

  if (error) return { error: error.message }

  revalidatePath(`/groups/${groupId}`)
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const groupId = formData.get("groupId") as string
  const targetUserId = formData.get("userId") as string

  const { data: adminCheck } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single()

  if (!adminCheck) return { error: "Not authorized" }

  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", targetUserId)

  revalidatePath(`/groups/${groupId}`)
}

export async function transferOwnership(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const groupId = formData.get("groupId") as string
  const newAdminId = formData.get("userId") as string

  const { data: adminCheck } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single()

  if (!adminCheck) return { error: "Not authorized" }

  await supabase
    .from("group_members")
    .update({ role: "member" })
    .eq("group_id", groupId)
    .eq("user_id", user.id)

  await supabase
    .from("group_members")
    .update({ role: "admin" })
    .eq("group_id", groupId)
    .eq("user_id", newAdminId)

  revalidatePath(`/groups/${groupId}`)
}

export async function setGroupCover(groupId: string, photoUrl: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: member } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!member || member.role !== "admin") return { error: "Not authorized" }

  const { error } = await supabase
    .from("groups")
    .update({ cover_url: photoUrl })
    .eq("id", groupId)

  if (error) return { error: error.message }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath("/dashboard")
}

export async function deleteGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const groupId = formData.get("groupId") as string

  const { data: adminCheck } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single()

  if (!adminCheck) return { error: "Not authorized" }

  const { error } = await supabase.from("groups").delete().eq("id", groupId)
  if (error) return { error: error.message }

  revalidatePath("/dashboard")
}
