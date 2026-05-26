"use client"

import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "danger" | "secondary"
}) {
  const { pending } = useFormStatus()

  const base =
    variant === "primary"
      ? "rounded-xl bg-gradient-to-r from-primary to-accent font-semibold hover:opacity-90 shadow-lg shadow-primary/25"
      : variant === "danger"
        ? "rounded-xl bg-red-600 font-semibold hover:bg-red-500"
        : "rounded-xl border border-border font-medium hover:bg-white/5"

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} px-5 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {pending && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
