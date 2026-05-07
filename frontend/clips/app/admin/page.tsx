"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/admin/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { users, videos } from "@/data/mock";

type AdminStats = {
  totalUsers?: number;
  totalVideos?: number;
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

const demoStats: AdminStats = {
  totalUsers: users.length,
  totalVideos: videos.length,
};

const demoHealth: AdminHealth = {
  uptime: typeof performance !== "undefined" ? performance.now() / 1000 : 0,
  dbStatus: "demo",
  memoryUsage: undefined,
};

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
      router.replace("/auth/login?callbackUrl=/admin");
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
          throw new Error(
            !statsRes.ok
              ? `Stats failed (${statsRes.status})`
              : `Health failed (${healthRes.status})`
          );
        }

        const statsJson = (await statsRes.json()) as { data?: AdminStats };
        const healthJson = (await healthRes.json()) as { data?: AdminHealth };

        if (!cancelled) {
          setStats(statsJson.data ?? demoStats);
          setHealth(healthJson.data ?? demoHealth);
        }
      } catch (error) {
        if (!cancelled) {
          setStats(demoStats);
          setHealth(demoHealth);
          setFetchError(
            error instanceof Error
              ? `Demo data shown: ${error.message}`
              : "Demo data shown because the backend could not be reached."
          );
        }
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
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          role="status"
        >
          {fetchError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <StatCard title="System health">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Server status</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fetchError ? "bg-red-500/15 text-red-300" : health ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/15 text-zinc-300"}`}>
                {fetchError ? "Offline" : health ? "Online" : dataLoading ? "Checking" : "Unknown"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Database</span>
              <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 capitalize">
                {health?.dbStatus ?? "—"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Uptime</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                {health?.uptime != null ? formatUptime(health.uptime) : "—"}
              </span>
            </li>
          </ul>
          {health?.memoryUsage ? (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Memory RSS {formatBytes(health.memoryUsage.rss)}
            </p>
          ) : null}
        </StatCard>
      </div>
    </main>
  );
}
