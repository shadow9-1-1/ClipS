"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { videos as demoVideos, users as demoUsers } from "@/data/mock";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminUserDetailPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) return router.replace('/auth/login?callbackUrl=/admin/users');
    if (authUser.role !== 'admin') return router.replace('/');

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const headers = 'Authorization' in getBearerAuthHeader() ? { ...getBearerAuthHeader() } : {};
        const res = await fetch(`${getApiPrefix()}/v1/admin/users/${id}`, { credentials: 'include', headers });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json.data);
      } catch (err) {
        // fallback to demo
        const demoUser = demoUsers.find(u => u.id === id) || demoUsers[0];
        const demoUserVideos = demoVideos.filter(v => v.userId === demoUser.id);
        if (!cancelled) setData({ user: demoUser, videos: demoUserVideos });
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [authLoading, authUser, id, router]);

  async function handleDelete() {
    if (!confirm('Delete this user and their videos?')) return;
    const headers = 'Authorization' in getBearerAuthHeader() ? { ...getBearerAuthHeader() } : {};
    try {
      const res = await fetch(`${getApiPrefix()}/v1/admin/users/${id}`, { method: 'DELETE', credentials: 'include', headers });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      router.push('/admin/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (loading || !data) return <div className="flex items-center gap-3"><Spinner /><span>Loading…</span></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{data.user.displayName ?? data.user.username}</h3>
          <p className="text-sm text-zinc-500">{data.user.email ?? data.user.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-red-600" onClick={handleDelete}>Delete user</button>
        </div>
      </div>

      <section>
        <h4 className="text-lg font-medium">Videos</h4>
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.videos?.length ? data.videos.map((v: any) => (
            <div key={v._id ?? v.id} className="rounded-md border p-3">
              <div className="text-sm font-semibold">{v.title ?? v.caption}</div>
              <div className="mt-1 text-xs text-zinc-500">{v.duration ?? v.createdAt}</div>
            </div>
          )) : <div className="text-sm text-zinc-500">No videos</div>}
        </div>
      </section>
    </div>
  );
}
