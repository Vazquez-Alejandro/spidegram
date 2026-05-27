import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication Error — Spidegram",
}

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await props.searchParams

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-400">
          Authentication Error
        </h1>
        <p className="text-gray-400">
          {message || "Something went wrong. Please try again."}
        </p>
        <a
          href="/auth/sign-in"
          className="text-primary hover:underline text-sm"
        >
          Back to sign in
        </a>
      </div>
    </div>
  )
}
