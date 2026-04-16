"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VideoGrid, type VideoGridItem } from "@/components/video/VideoGrid";
import { Spinner } from "@/components/ui/Spinner";
import { getApiPrefix } from "@/lib/api";

const PAGE_SIZE = 10;

type ApiVideo = {
  _id?: string;
  title?: string;
  description?: string;
  videoURL?: string;
  duration?: number;
  owner?: { _id?: string } | string;
};

function mapApiVideo(v: ApiVideo): VideoGridItem {
  let ownerId: string | undefined;
  if (v.owner && typeof v.owner === "object" && v.owner._id) {
    ownerId = String(v.owner._id);
  }

  return {
    id: String(v._id ?? ""),
    videoUrl: typeof v.videoURL === "string" ? v.videoURL : "",
    title: typeof v.title === "string" ? v.title : "Untitled",
    description: typeof v.description === "string" ? v.description : "",
    duration: typeof v.duration === "number" ? v.duration : 0,
    ownerId,
  };
}

export function InfiniteVideoFeed() {
  const [videos, setVideos] = useState<VideoGridItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialDone, setInitialDone] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const skipRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const url = `${getApiPrefix()}/v1/videos?limit=${PAGE_SIZE}&skip=${skipRef.current}`;

      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      const json = (await res.json()) as {
        total?: number;
        data?: { videos?: ApiVideo[] };
      };

      const raw = json?.data?.videos ?? [];
      const total = typeof json?.total === "number" ? json.total : 0;
      const batch = raw.map(mapApiVideo).filter((x) => x.id);

      if (batch.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      setVideos((prev) => [...prev, ...batch]);
      skipRef.current += batch.length;

      const loaded = skipRef.current;
      const more =
        total > 0 ? loaded < total : batch.length === PAGE_SIZE;

      hasMoreRef.current = more;
      setHasMore(more);
    } catch {
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialDone(true);
    }
  }, []);

  useEffect(() => {
    void loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    if (!hasMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        void loadNextPage();
      },
      { root: null, rootMargin: "160px", threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadNextPage, videos.length]);

  const showInitialSpinner = !initialDone && videos.length === 0;
  const showEmpty = initialDone && videos.length === 0;
  const showGrid = videos.length > 0;

  return (
    <div className="w-full">
      {showInitialSpinner ? (
        <div
          className="flex justify-center py-20"
          role="status"
          aria-live="polite"
        >
          <Spinner size="lg" label="Loading videos" />
        </div>
      ) : null}

      {showEmpty ? (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            No videos found
          </p>
        </div>
      ) : null}

      {showGrid ? (
        <VideoGrid
          videos={videos}
          footer={
            <div className="flex flex-col items-stretch gap-3 pb-4">
              {loading && hasMore ? (
                <div
                  className="flex justify-center py-2"
                  role="status"
                  aria-live="polite"
                >
                  <Spinner size="sm" label="Loading more videos" />
                </div>
              ) : null}

              {hasMore ? (
                <div
                  ref={sentinelRef}
                  className="h-4 w-full shrink-0"
                  aria-hidden
                />
              ) : (
                <p className="py-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  You&apos;re all caught up
                </p>
              )}
            </div>
          }
        />
      ) : null}
    </div>
  );
}
