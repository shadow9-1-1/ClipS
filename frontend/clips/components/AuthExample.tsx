"use client";

import { useAuth } from "@/hooks/useAuth";

/**
 * Example client component: reads global auth from AuthProvider.
 * Safe to delete or replace once real UI is wired up.
 */
export function AuthExample() {
  const { user, loading, error, refetch, logout } = useAuth();

  if (loading) {
    return (
      <p className="text-sm text-zinc-500" data-testid="auth-loading">
        Checking session…
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1 text-left hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-sm text-zinc-500">
        Not signed in (no valid session cookie).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <p>
        Signed in as <span className="font-medium">{user.username}</span> (
        {user.email})
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          onClick={() => void refetch()}
        >
          Refresh profile
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          onClick={logout}
        >
          Log out (client)
        </button>
      </div>
    </div>
  );
}
