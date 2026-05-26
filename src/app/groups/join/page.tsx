import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { joinGroup } from "@/lib/supabase/groups"

export default async function JoinGroupPage(props: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await props.searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  if (id) {
    const { error } = await supabase.from("group_members").insert({
      group_id: id,
      user_id: user.id,
      role: "member",
    })

    const { data: group } = await supabase
      .from("groups")
      .select("id, name")
      .eq("id", id)
      .single()

    if (error || !group) {
      redirect(`/groups/join?error=${encodeURIComponent("Invalid or expired invite link")}`)
    }

    revalidatePath("/dashboard")
    redirect(`/groups/${group.id}`)
  }

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-4 py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🔗</div>
          <h1 className="text-2xl font-bold">Join a Group</h1>
          <p className="text-gray-400 mt-1 text-sm">Enter the group ID to join</p>
        </div>
        <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="groupId" className="text-sm text-gray-400 font-medium">Group ID</label>
            <input
              id="groupId"
              name="groupId"
              type="text"
              required
              placeholder="Paste the group ID here"
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <button
            type="submit"
            formAction={joinGroup}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Join group
          </button>
        </form>
      </div>
    </main>
  )
}
