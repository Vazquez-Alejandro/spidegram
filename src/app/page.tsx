export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="text-6xl">🕷️</div>
        <h1 className="text-4xl font-bold tracking-tight">Spidegram</h1>
        <p className="text-lg text-gray-400">
          Private photo groups for the people who matter most
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/auth/sign-in"
            className="rounded-lg bg-primary px-6 py-3 font-medium hover:bg-primary-hover transition-colors"
          >
            Sign in
          </a>
          <a
            href="/auth/sign-up"
            className="rounded-lg border border-gray-700 px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Sign up
          </a>
        </div>
      </div>
    </main>
  )
}
