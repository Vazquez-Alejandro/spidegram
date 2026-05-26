import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  const flash = (type: string, msg: string) =>
    `${origin}${next}${next.includes("?") ? "&" : "?"}flash_type=${type}&flash_msg=${encodeURIComponent(msg)}`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const isReset = next.includes("reset-password")
      return NextResponse.redirect(
        isReset
          ? flash("success", "Email confirmed! Set a new password.")
          : flash("success", "Email confirmed successfully!"),
      )
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=Auth failed`)
}
