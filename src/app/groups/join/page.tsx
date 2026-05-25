import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { joinGroup } from "@/lib/supabase/groups"

export default async function JoinGroupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Join a Group</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="groupId" className="text-sm text-gray-400">Group ID</label>
          <input
            id="groupId"
            name="groupId"
            type="text"
            required
            placeholder="Paste the group ID or invite link"
            className="rounded-lg border border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          formAction={joinGroup}
          className="rounded-lg bg-primary px-6 py-3 font-medium hover:bg-primary-hover transition-colors"
        >
          Join group
        </button>
      </form>
    </main>
  )
}
