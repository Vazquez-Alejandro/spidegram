import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateProfile } from "@/lib/supabase/actions"

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-4 py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-4xl mb-3">✏️</div>
          <h1 className="text-2xl font-bold">Edit profile</h1>
        </div>
        <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-sm text-gray-400 font-medium">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Your full name"
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm text-gray-400 font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={profile?.username ?? ""}
              placeholder="yourusername"
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Your email: <span className="text-gray-400">{user.email}</span>
          </div>
          <button
            type="submit"
            formAction={updateProfile}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Save changes
          </button>
        </form>
      </div>
    </main>
  )
}
