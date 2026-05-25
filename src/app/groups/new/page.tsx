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
    <main className="flex-1 mx-auto max-w-md w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Create a Group</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm text-gray-400">Group name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-lg border border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-gray-400">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="rounded-lg border border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <button
          type="submit"
          formAction={createGroup}
          className="rounded-lg bg-primary px-6 py-3 font-medium hover:bg-primary-hover transition-colors"
        >
          Create group
        </button>
      </form>
    </main>
  )
}
