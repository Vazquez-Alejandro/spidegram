"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { redirectWithFlash } from "@/lib/flash"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirectWithFlash("/auth/sign-up", "error", error.message)
  }

  revalidatePath("/")
  redirectWithFlash("/", "success", "Check your email to confirm your account")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirectWithFlash("/auth/sign-in", "error", error.message)
  }

  revalidatePath("/")
  redirectWithFlash("/dashboard", "success", "Welcome back!")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath("/")
  redirectWithFlash("/", "success", "Signed out")
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

  if (error) redirectWithFlash("/profile/edit", "error", error.message)

  revalidatePath("/profile")
  revalidatePath(`/profile/${user.id}`)
  redirectWithFlash(`/profile/${user.id}`, "success", "Profile updated!")
}

export async function resetPasswordRequest(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  if (!email) return

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    redirectWithFlash("/auth/forgot-password", "error", error.message)
  }

  redirectWithFlash("/auth/sign-in", "success", "Check your email for the reset link")
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get("password") as string
  if (!password || password.length < 6) {
    redirectWithFlash("/auth/reset-password", "error", "Password must be at least 6 characters")
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirectWithFlash("/auth/reset-password", "error", error.message)
  }

  redirectWithFlash("/dashboard", "success", "Password updated successfully!")
}
