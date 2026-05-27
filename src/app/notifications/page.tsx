import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/supabase/social"

export const metadata: Metadata = {
  title: "Notifications — Spidegram",
}

const notificationLabels: Record<string, string> = {
  photo_uploaded: "uploaded a photo for your approval",
  photo_approved: "approved your photo",
  photo_rejected: "rejected your photo",
  new_comment: "commented on your photo",
  new_follower: "started following you",
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: rawNotifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const notifications = rawNotifications ?? []

  const actorIds = [...new Set(notifications.map((n) => n.actor_id))]
  const { data: actorProfiles } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", actorIds)
    : { data: [] }

  const actorMap = new Map(actorProfiles?.map((p) => [p.id, p]) ?? [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => {
            const actor = actorMap.get(n.actor_id)
            const actorName = actor?.full_name || actor?.username || "Someone"

            return (
              <form
                key={n.id}
                action={markNotificationRead.bind(null, n.id)}
                className={`block rounded-xl px-4 py-3 transition-all hover:bg-white/[0.02] ${
                  n.read
                    ? "opacity-40"
                    : "bg-gradient-to-r from-primary/[0.03] to-transparent border-l-2 border-primary"
                }`}
              >
                <button
                  type="submit"
                  className="w-full text-left cursor-pointer"
                >
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">{actorName}</span>{" "}
                    {notificationLabels[n.type] ?? n.type}
                    {n.type === "new_follower" && (
                      <span className="text-primary ml-1">· Follow back</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              </form>
            )
          })}
        </div>
      )}
    </main>
  )
}
