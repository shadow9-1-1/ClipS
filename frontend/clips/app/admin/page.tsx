"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/admin/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

type AdminStats = {
  totalUsers?: number;
  totalVideos?: number;
  mostActiveUsers?: Array<{
    username?: string;
    videoCount?: number;
  }>;
};

type AdminHealth = {
  uptime?: number;
  memoryUsage?: {
    rss?: number;
    heapUsed?: number;
    heapTotal?: number;
  };
  dbStatus?: string;
};

function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatBytes(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const mb = n / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?callbackUrl=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user || user.role !== "admin") return;

    let cancelled = false;

    async function load() {
      setDataLoading(true);
      setFetchError(null);
      const auth = getBearerAuthHeader();
      if (!("Authorization" in auth)) {
        setFetchError("Missing auth token. Sign in again.");
        setDataLoading(false);
        return;
      }

      const headers = { ...auth };

      try {
        const [statsRes, healthRes] = await Promise.all([
          fetch(`${getApiPrefix()}/v1/admin/stats`, {
            credentials: "include",
            cache: "no-store",
            headers,
          }),
          fetch(`${getApiPrefix()}/v1/admin/health`, {
            credentials: "include",
            cache: "no-store",
            headers,
          }),
        ]);

        if (!statsRes.ok || !healthRes.ok) {
          const msg =
            !statsRes.ok
              ? `Stats failed (${statsRes.status})`
              : `Health failed (${healthRes.status})`;
          if (!cancelled) setFetchError(msg);
          return;
        }

        const statsJson = (await statsRes.json()) as { data?: AdminStats };
        const healthJson = (await healthRes.json()) as { data?: AdminHealth };

        if (!cancelled) {
          setStats(statsJson.data ?? null);
          setHealth(healthJson.data ?? null);
        }
      } catch {
        if (!cancelled) setFetchError("Network error while loading admin data.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" label="Checking access" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Verifying session…</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Redirecting…</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-8 py-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Platform statistics and system health
        </p>
      </div>

      {dataLoading ? (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <Spinner size="md" label="Loading dashboard data" />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading metrics…
          </span>
        </div>
      ) : null}

      {fetchError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {fetchError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total users">
          <p className="text-3xl font-semibold tabular-nums">
            {stats?.totalUsers ?? "—"}
          </p>
        </StatCard>
        <StatCard title="Total videos">
          <p className="text-3xl font-semibold tabular-nums">
            {stats?.totalVideos ?? "—"}
          </p>
        </StatCard>
        <StatCard title="Database">
          <p className="text-lg font-medium capitalize">
            {health?.dbStatus ?? "—"}
          </p>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatCard title="Server uptime">
          <p className="text-2xl font-semibold tabular-nums">
            {health?.uptime != null
              ? formatUptime(health.uptime)
              : "—"}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Process uptime (server)
          </p>
        </StatCard>
        <StatCard title="Memory usage">
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">RSS</span>
              <span className="font-mono tabular-nums">
                {formatBytes(health?.memoryUsage?.rss)}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Heap used</span>
              <span className="font-mono tabular-nums">
                {formatBytes(health?.memoryUsage?.heapUsed)}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Heap total</span>
              <span className="font-mono tabular-nums">
                {formatBytes(health?.memoryUsage?.heapTotal)}
              </span>
            </li>
          </ul>
        </StatCard>
      </div>

      {stats?.mostActiveUsers && stats.mostActiveUsers.length > 0 ? (
        <StatCard title="Most active creators (top 5)">
          <ul className="mt-2 space-y-2 text-sm">
            {stats.mostActiveUsers.map((u, i) => (
              <li
                key={i}
                className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800"
              >
                <span className="font-medium">
                  {u.username ?? "User"}
                </span>
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                  {u.videoCount ?? 0} videos
                </span>
              </li>
            ))}
          </ul>
        </StatCard>
      ) : null}
    </main>
  );
}
