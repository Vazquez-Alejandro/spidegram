import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PhotoUpload } from "@/components/photo-upload"
import { LeaveGroupButton } from "@/components/leave-group-button"
import { MemberManager } from "@/components/member-manager"
import { GroupEditor } from "@/components/group-editor"
import { PhotoGrid } from "@/components/photo-grid"
import { InviteLink } from "@/components/invite-link"
import { PhotoSearch } from "@/components/photo-search"
import { BulkActions } from "@/components/bulk-actions"
import { ActivityFeed } from "@/components/activity-feed"
import { AlbumTabs, CreateAlbumForm } from "@/components/album-tabs"

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", id)
    .single()

  return {
    title: group ? `${group.name} — Spidegram` : "Group — Spidegram",
  }
}

export default async function GroupPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; album?: string }>
}) {
  const { id } = await props.params
  const { error: uploadError, album: activeAlbum } = await props.searchParams
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
    .select("id, user_id, role, joined_at")
    .eq("group_id", id)

  const { data: memberProfiles } = members?.length
    ? await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", members.map((m) => m.user_id))
    : { data: [] }

  const memberMap = new Map(memberProfiles?.map((p) => [p.id, p]) ?? [])

  const isAdmin = member.role === "admin"

  const { data: pendingPhotos } = isAdmin
    ? await supabase
        .from("photos")
        .select("*")
        .eq("group_id", id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
    : { data: [] }

  const { data: uploaderIds } = pendingPhotos?.length
    ? await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", pendingPhotos.map((p) => p.uploader_id))
    : { data: [] }

  const uploaderMap = new Map(uploaderIds?.map((p) => [p.id, p]) ?? [])

  const { data: approvedPhotos } = await supabase
    .from("photos")
    .select("*")
    .eq("group_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const { data: albums } = await supabase
    .from("albums")
    .select("id, name, description, cover_url, created_by, created_at, updated_at")
    .eq("group_id", id)
    .order("name")

  const { data: photoCounts } = albums?.length
    ? await supabase
        .from("photos")
        .select("album_id")
        .eq("group_id", id)
        .eq("status", "approved")
        .in("album_id", albums.map((a) => a.id))
    : { data: [] }

  const albumPhotoCounts: Record<string, number> = {}
  for (const p of photoCounts ?? []) {
    if (p.album_id) {
      albumPhotoCounts[p.album_id] = (albumPhotoCounts[p.album_id] ?? 0) + 1
    }
  }

  const filteredPhotos = activeAlbum
    ? approvedPhotos?.filter((p) => p.album_id === activeAlbum) ?? []
    : approvedPhotos ?? []

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
      {group.cover_url && (
        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden mb-8 bg-surface ring-1 ring-white/5">
          <img src={group.cover_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      {uploadError && (
        <div className="mb-6 rounded-xl bg-red-900/40 border border-red-800/50 px-4 py-3 text-sm text-red-300 animate-scale-in">
          {uploadError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {isAdmin && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
          {group.description && (
            <p className="text-gray-400 mt-1 text-sm leading-relaxed max-w-xl">{group.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
            <span>{members?.length ?? 0} member{members?.length !== 1 ? "s" : ""}</span>
            <span className="text-border">·</span>
            <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isAdmin && (
            <GroupEditor
              groupId={id}
              initialName={group.name}
              initialDescription={group.description}
            />
          )}
          <LeaveGroupButton groupId={id} />
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Members</h2>
          <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {members?.length ?? 0}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        {isAdmin ? (
          <MemberManager
            groupId={id}
            members={members?.map((m) => ({
              id: m.id,
              user_id: m.user_id,
              role: m.role,
              name:
                memberMap.get(m.user_id)?.full_name ||
                memberMap.get(m.user_id)?.username ||
                m.user_id.slice(0, 8),
            })) ?? []}
            currentUserId={user.id}
          />
        ) : members && members.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const profile = memberMap.get(m.user_id)
              const name = profile?.full_name || profile?.username || m.user_id.slice(0, 8)
              const initial = name.charAt(0).toUpperCase()
              return (
                <a
                  key={m.id}
                  href={`/profile/${m.user_id}`}
                  className="flex items-center gap-2 rounded-xl bg-surface border border-border px-3 py-1.5 text-sm hover:border-primary/20 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold shrink-0">
                    {initial}
                  </div>
                  <span className="truncate max-w-[120px]">{name}</span>
                  {m.role === "admin" && (
                    <span className="text-[10px] text-primary font-medium">★</span>
                  )}
                </a>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No members found.</p>
        )}
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Upload</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <PhotoUpload groupId={id} />
      </section>

      <section className="mb-10">
        <InviteLink groupId={id} origin={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"} />
      </section>

      {isAdmin && pendingPhotos && pendingPhotos.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              Pending approval
            </h2>
            <span className="text-[11px] font-medium text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
              {pendingPhotos.length}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <BulkActions
            groupId={id}
            photos={pendingPhotos.map((p) => ({
              id: p.id,
              url: p.url,
              caption: p.caption,
              uploader_id: p.uploader_id,
              uploader_name:
                uploaderMap.get(p.uploader_id)?.username ||
                uploaderMap.get(p.uploader_id)?.full_name ||
                "Unknown",
            }))}
          />
        </section>
      )}

      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Activity</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <ActivityFeed groupId={id} />
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Photos</h2>
          <span className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {approvedPhotos?.length ?? 0}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="mb-4">
          <PhotoSearch groupId={id} />
        </div>
        <AlbumTabs
          albums={(albums ?? []).map((a) => ({
            id: a.id,
            name: a.name,
            photo_count: albumPhotoCounts[a.id] ?? 0,
          }))}
          activeAlbum={activeAlbum ?? null}
          onSelect={(albumId) => {
            const params = new URLSearchParams()
            if (albumId) params.set("album", albumId)
            const qs = params.toString()
            window.location.href = `/groups/${id}${qs ? `?${qs}` : ""}`
          }}
          onCreate={() => {
            const form = document.getElementById("create-album-form")
            if (form) form.classList.toggle("hidden")
          }}
        />
        <div id="create-album-form" className="hidden mb-4">
          <CreateAlbumForm
            groupId={id}
            onDone={() => window.location.reload()}
          />
        </div>
        <PhotoGrid
          initialPhotos={(filteredPhotos ?? []).slice(0, 12)}
          groupId={id}
          albumId={activeAlbum ?? null}
          pageSize={12}
          isAdmin={isAdmin}
          currentCover={group.cover_url}
        />
      </section>
    </main>
  )
}
