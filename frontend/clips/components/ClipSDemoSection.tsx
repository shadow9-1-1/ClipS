"use client";

import { useCallback, useEffect, useState } from "react";
import { useUI } from "@/context/UIContext";
import { getApiPrefix } from "@/lib/api";
import { parseErrorFromUnknown } from "@/lib/parse-api-error";
import { Spinner } from "@/components/ui/Spinner";
import { VideoListSkeleton } from "@/components/ui/Skeleton";

type VideoRow = {
  _id: string;
  title: string;
  description?: string;
  owner?: { username?: string };
};

function videosListUrl(): string {
  return `${getApiPrefix()}/v1/videos?limit=5&skip=0`;
}

export function ClipSDemoSection() {
  const { showError, showErrorFromResponse, showErrorFromUnknown } = useUI();
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadBusy, setReloadBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);

  const fetchVideos = useCallback(
    async (opts?: { signal?: AbortSignal }) => {
      const res = await fetch(videosListUrl(), {
        credentials: "include",
        cache: "no-store",
        signal: opts?.signal,
      });
      if (!res.ok) {
        await showErrorFromResponse(res);
        setVideos([]);
        return;
      }
      const json = (await res.json()) as {
        data?: { videos?: VideoRow[] };
      };
      setVideos(json?.data?.videos ?? []);
    },
    [showErrorFromResponse]
  );

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      try {
        await fetchVideos({ signal: ac.signal });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        showErrorFromUnknown(e);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      ac.abort();
    };
  }, [fetchVideos, showErrorFromUnknown]);

  const reload = async () => {
    setReloadBusy(true);
    try {
      await fetchVideos();
    } catch (e) {
      showErrorFromUnknown(e);
      setVideos([]);
    } finally {
      setReloadBusy(false);
    }
  };

  const simulateUnauthorizedSubmit = async () => {
    setSubmitBusy(true);
    try {
      const res = await fetch(`${getApiPrefix()}/v1/videos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Demo",
          duration: 60,
        }),
      });
      if (!res.ok) await showErrorFromResponse(res);
    } catch (e) {
      showErrorFromUnknown(e);
    } finally {
      setSubmitBusy(false);
    }
  };

  const simulateNetworkError = () => {
    showError(parseErrorFromUnknown(new TypeError("Failed to fetch")));
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-900/40">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          UI state demo
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Skeleton + spinner while loading, global error modal on API failures.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={reloadBusy || loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => void reload()}
        >
          {reloadBusy ? <Spinner size="sm" label="Reloading" /> : null}
          Reload videos
        </button>
        <button
          type="button"
          disabled={submitBusy}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => void simulateUnauthorizedSubmit()}
        >
          {submitBusy ? <Spinner size="sm" label="Submitting" /> : null}
          Simulate form submit (expect 401)
        </button>
        <button
          type="button"
          className="inline-flex min-h-10 items-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          onClick={simulateNetworkError}
        >
          Simulate network error
        </button>
      </div>

      {loading ? (
        <VideoListSkeleton count={3} />
      ) : videos.length === 0 ? (
        <p className="text-sm text-zinc-500">No public videos loaded.</p>
      ) : (
        <ul className="space-y-2">
          {videos.map((v) => (
            <li
              key={v._id}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {v.title}
              </p>
              {v.owner?.username ? (
                <p className="text-xs text-zinc-500">@{v.owner.username}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
