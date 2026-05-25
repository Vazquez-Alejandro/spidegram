import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/supabase/social"

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

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, actor:profiles!actor_id(username, full_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const unreadCount =
    notifications?.filter((n) => !n.read).length ?? 0

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <p className="text-center py-16 text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => {
            const actor = n.actor as unknown as {
              username: string | null
              full_name: string | null
            } | null
            const actorName = actor?.full_name || actor?.username || "Someone"

            return (
              <form
                key={n.id}
                action={markNotificationRead.bind(null, n.id)}
                className={`block rounded-lg px-4 py-3 transition-colors ${
                  n.read ? "opacity-50" : "bg-gray-900 border border-gray-800"
                }`}
              >
                <button
                  type="submit"
                  className="w-full text-left cursor-pointer"
                >
                  <p className="text-sm">
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
