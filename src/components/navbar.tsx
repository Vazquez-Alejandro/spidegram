import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/supabase/actions"

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let unreadCount = 0
  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
    unreadCount = count ?? 0
  }

  return (
    <nav className="border-b border-gray-800">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <a
          href={user ? "/dashboard" : "/"}
          className="text-xl font-bold tracking-tight"
        >
          🕷️ Spidegram
        </a>
        {user && (
          <div className="flex items-center gap-5">
            <a
              href="/feed"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Feed
            </a>
            <a
              href="/friends"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Friends
            </a>
            <a
              href="/notifications"
              className="relative text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </a>
            <a
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              My Groups
            </a>
            <span className="text-sm text-gray-500">{user.email}</span>
            <form>
              <button
                type="submit"
                formAction={signOut}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  )
}
