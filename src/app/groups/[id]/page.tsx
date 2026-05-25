import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { leaveGroup } from "@/lib/supabase/groups"
import { approvePhoto, rejectPhoto } from "@/lib/supabase/photos"
import { PhotoUpload } from "@/components/photo-upload"

export default async function GroupPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await props.params
  const { error: uploadError } = await props.searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single()

  if (!group) redirect("/dashboard")

  const { data: member } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", id)
    .eq("user_id", user.id)
    .single()

  if (!member) redirect("/dashboard")

  const { data: members } = await supabase
    .from("group_members")
    .select("*, profiles(username, full_name, avatar_url)")
    .eq("group_id", id)

  const isAdmin = member.role === "admin"

  const { data: pendingPhotos } = isAdmin
    ? await supabase
        .from("photos")
        .select("*, profiles(username, full_name)")
        .eq("group_id", id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
    : { data: [] }

  const { data: approvedPhotos } = await supabase
    .from("photos")
    .select("*, profiles(username, full_name)")
    .eq("group_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
      {uploadError && (
        <div className="mb-6 rounded-lg bg-red-900/50 border border-red-800 px-4 py-3 text-sm text-red-300">
          {uploadError}
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-400 mt-1">{group.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {members?.length ?? 0} member{members?.length !== 1 ? "s" : ""}
            {isAdmin && <span className="ml-2 text-primary">· Admin</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <form
            action={leaveGroup.bind(null, id)}
            onSubmit={(e) => {
              if (!confirm("Are you sure you want to leave this group?")) {
                e.preventDefault()
              }
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-red-900 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950 transition-colors"
            >
              Leave
            </button>
          </form>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        <div className="flex flex-wrap gap-2">
          {members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-sm"
            >
              <span>
                {m.profiles?.full_name || m.profiles?.username || m.user_id.slice(0, 8)}
              </span>
              {m.role === "admin" && (
                <span className="text-xs text-primary">· admin</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Upload a photo</h2>
        <PhotoUpload groupId={id} />
      </section>

      {isAdmin && pendingPhotos && pendingPhotos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-yellow-400">
            Pending approval ({pendingPhotos.length})
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {pendingPhotos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-xl bg-gray-900 overflow-hidden border border-yellow-900/50"
              >
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  {photo.caption && (
                    <p className="text-xs text-gray-400 truncate">{photo.caption}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    by {photo.profiles?.username || photo.profiles?.full_name || "Unknown"}
                  </p>
                  <div className="flex gap-2">
                    <form action={approvePhoto.bind(null, photo.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-green-700 px-3 py-1 text-xs font-medium hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectPhoto.bind(null, photo.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-red-800 px-3 py-1 text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">
          Photos ({approvedPhotos?.length ?? 0})
        </h2>
        {!approvedPhotos || approvedPhotos.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No approved photos yet. Photos approved by admins will appear here.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {approvedPhotos.map((photo) => (
              <a
                key={photo.id}
                href={`/photos/${photo.id}`}
                className="aspect-square rounded-xl bg-gray-800 overflow-hidden group relative"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
