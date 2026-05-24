import { signUp } from "@/lib/supabase/actions"

export default function SignUpPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-gray-400 mt-1">Join Spidegram</p>
        </div>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-lg border border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            formAction={signUp}
            className="rounded-lg bg-primary px-6 py-3 font-medium hover:bg-primary-hover transition-colors"
          >
            Sign up
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
