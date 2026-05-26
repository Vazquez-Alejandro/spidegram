import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateProfile, updateAvatar } from "@/lib/supabase/actions"

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

        <form className="flex flex-col items-center gap-3">
          <label className="group relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold">
                {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || user.email?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input type="file" name="avatar" accept="image/*" className="hidden" form="avatarForm" />
          </label>
          <button
            type="submit"
            form="avatarForm"
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Change photo
          </button>
        </form>

        <form id="avatarForm" action={updateAvatar} className="hidden" />

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
