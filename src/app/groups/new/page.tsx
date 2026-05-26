import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createGroup } from "@/lib/supabase/groups"

export default async function NewGroupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-4 py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🕸️</div>
          <h1 className="text-2xl font-bold">Create a Group</h1>
          <p className="text-gray-400 mt-1 text-sm">Start a new photo group</p>
        </div>
        <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm text-gray-400 font-medium">Group name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Family Road Trip 2024"
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm text-gray-400 font-medium">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What's this group about?"
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cover" className="text-sm text-gray-400 font-medium">Cover photo (optional)</label>
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/*"
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer"
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            <input
              type="checkbox"
              name="is_public"
              className="rounded border-border bg-surface text-primary focus:ring-primary/50"
            />
            Make group public (anyone can find and join)
          </label>
          <button
            type="submit"
            formAction={createGroup}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Create group
          </button>
        </form>
      </div>
    </main>
  )
}
