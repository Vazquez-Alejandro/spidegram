"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, description, created_by: user.id })
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
  redirect(`/groups/${group.id}`)
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

  if (error) redirect(`/auth/error?message=${encodeURIComponent(error.message)}`)

  revalidatePath("/dashboard")
  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
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
  redirect("/dashboard")
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
