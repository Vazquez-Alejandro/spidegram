"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function createAlbum(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const groupId = formData.get("groupId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name?.trim()) return { error: "Album name is required" }

  const { error } = await supabase.from("albums").insert({
    group_id: groupId,
    name: name.trim(),
    description: description?.trim() || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath(`/groups/${groupId}`)
}

export async function updateAlbum(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const albumId = formData.get("albumId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name?.trim()) return { error: "Album name is required" }

  const { data: album } = await supabase
    .from("albums")
    .select("group_id")
    .eq("id", albumId)
    .single()

  if (!album) return { error: "Album not found" }

  const { error } = await supabase
    .from("albums")
    .update({ name: name.trim(), description: description?.trim() || null })
    .eq("id", albumId)

  if (error) return { error: error.message }

  revalidatePath(`/groups/${album.group_id}`)
}

export async function deleteAlbum(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const albumId = formData.get("albumId") as string

  const { data: album } = await supabase
    .from("albums")
    .select("group_id")
    .eq("id", albumId)
    .single()

  if (!album) return { error: "Album not found" }

  const { error } = await supabase.from("albums").delete().eq("id", albumId)

  if (error) return { error: error.message }

  revalidatePath(`/groups/${album.group_id}`)
}

export async function movePhotosToAlbum(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const albumId = formData.get("albumId") as string
  const photoIds = JSON.parse(formData.get("photoIds") as string) as string[]

  const { data: album } = await supabase
    .from("albums")
    .select("group_id")
    .eq("id", albumId)
    .single()

  if (!album) return { error: "Album not found" }

  const { error } = await supabase
    .from("photos")
    .update({ album_id: albumId })
    .in("id", photoIds)

  if (error) return { error: error.message }

  revalidatePath(`/groups/${album.group_id}`)
}
