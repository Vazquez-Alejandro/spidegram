"use client"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-sm flex flex-col gap-4">
        <div className="text-5xl">🤕</div>
        <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
        <p className="text-gray-400 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={reset}
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-xl border border-border px-5 py-2.5 font-semibold text-sm hover:bg-white/5 transition-all"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
