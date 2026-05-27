import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { resetPasswordRequest } from "@/lib/supabase/actions"

export const metadata: Metadata = {
  title: "Reset password — Spidegram",
}

export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-gray-400 font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <button
            type="submit"
            formAction={resetPasswordRequest}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Send reset link
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          <a href="/auth/sign-in" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  )
}
