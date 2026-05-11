"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { Spinner } from "@/components/ui/Spinner";

type UserItem = {
  _id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  verified?: boolean;
  active?: boolean;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.replace('/auth/login?callbackUrl=/admin/users');
    if (user.role !== 'admin') return router.replace('/');

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const auth = getBearerAuthHeader();
      const headers = 'Authorization' in auth ? { ...auth } : {};

      try {
        const res = await fetch(`${getApiPrefix()}/v1/admin/users`, {
          credentials: 'include', headers, cache: 'no-store'
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (!cancelled) setUsers(json?.data?.users ?? []);
      } catch (err) {
        if (!cancelled) {
          setUsers([]);
          setError(err instanceof Error ? err.message : 'Could not load users');
        }
      } finally { if (!cancelled) setLoading(false); }
    }

    void load();
    return () => { cancelled = true; };
  }, [authLoading, user, router]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this user and their videos? This cannot be undone.')) return;
    const auth = getBearerAuthHeader();
    const headers = 'Authorization' in auth ? { ...auth } : {};
    try {
      const res = await fetch(`${getApiPrefix()}/v1/admin/users/${id}`, { method: 'DELETE', credentials: 'include', headers });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setUsers((prev) => prev?.filter(u => u._id !== id) ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <Link href="/admin/users/new" className="text-sm text-zinc-500">Create user</Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3"><Spinner size="md" /><span>Loading users…</span></div>
      ) : null}

      {error ? <div className="rounded-md bg-amber-50 p-3 text-amber-800">{error}</div> : null}

      <div className="grid grid-cols-1 gap-3">
        {users?.map(u => (
          <div key={u._id} className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <img src={u.avatar} alt="avatar" className="h-10 w-10 rounded-md object-cover" />
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{u.displayName ?? u.username}</div>
                <div className="text-xs text-zinc-500">{u.username}{u.email ? ` · ${u.email}` : ''}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/users/${u._id}`} className="text-sm text-sky-600">View</Link>
              <button onClick={() => handleDelete(u._id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
