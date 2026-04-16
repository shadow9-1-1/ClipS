export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Sign in
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder page for middleware redirects. Wire this to your auth flow and
        set the <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">token</code>{" "}
        cookie after login.
      </p>
    </main>
  );
}
