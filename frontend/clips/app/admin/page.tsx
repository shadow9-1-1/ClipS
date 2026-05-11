"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/admin/StatCard";
import Metric from "@/components/admin/Metric";
import HealthBadge from "@/components/admin/HealthBadge";
import { Spinner } from "@/components/ui/Spinner";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

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

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reloadCounter, setReloadCounter] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
          setStats(statsJson.data ?? null);
          setHealth(healthJson.data ?? null);
          setLastUpdated(new Date());
        }
      } catch (error) {
        if (!cancelled) {
          setStats(null);
          setHealth(null);
          setLastUpdated(new Date());
          setFetchError(
            error instanceof Error
              ? `Could not load dashboard data: ${error.message}`
              : "Could not load dashboard data."
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
  }, [authLoading, user, reloadCounter]);

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
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Platform statistics and system health
          </p>
          {lastUpdated ? (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Last updated {lastUpdated.toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a href="/admin/users" className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
            Manage users
          </a>
          <button
            type="button"
            onClick={() => setReloadCounter((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6" />
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 7a9 9 0 10-2.6 6.3L20 20" />
            </svg>
            Refresh
          </button>
        </div>
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
        <StatCard
          title="Total users"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" />
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 20c0-3.866 3.582-7 8-7s8 3.134 8 7" />
            </svg>
          }
        >
          <Metric value={stats?.totalUsers ?? "—"} subtitle="Registered users on the platform" />
        </StatCard>

        <StatCard
          title="Total videos"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
              <rect x="3" y="6" width="12" height="12" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          <Metric value={stats?.totalVideos ?? "—"} subtitle="Total uploaded videos" />
        </StatCard>

        <StatCard
          title="System health"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l3 8 4-16 3 8h4" />
            </svg>
          }
        >
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">Server status</span>
              <HealthBadge status={fetchError ? "offline" : health ? "online" : "unknown"} />
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
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Memory RSS {formatBytes(health.memoryUsage.rss)}</p>
          ) : null}
        </StatCard>
      </div>
    </main>
  );
}
