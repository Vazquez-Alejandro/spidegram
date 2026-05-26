import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/dashboard")

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent pointer-events-none" />
      <div className="flex flex-col items-center gap-8 max-w-md text-center relative">
        <div className="text-7xl">🕷️</div>
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Spidegram
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Private photo groups for the people who matter most
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <a
            href="/auth/sign-in"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-7 py-3 font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            Sign in
          </a>
          <a
            href="/auth/sign-up"
            className="rounded-xl border border-border px-7 py-3 font-semibold text-sm hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
