"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/")
  redirect("/")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/")
  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath("/")
  redirect("/")
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const fullName = formData.get("full_name") as string
  const username = formData.get("username") as string

  const updates: Record<string, string> = {}
  if (fullName?.trim()) updates.full_name = fullName.trim()
  if (username?.trim()) updates.username = username.trim()

  if (Object.keys(updates).length === 0) redirect("/profile/edit")

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (error) redirect(`/auth/error?message=${encodeURIComponent(error.message)}`)

  revalidatePath("/profile")
  revalidatePath(`/profile/${user.id}`)
  redirect(`/profile/${user.id}`)
}
