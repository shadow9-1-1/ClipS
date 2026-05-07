"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { VideoCard } from "@/components/VideoCard";

export function HomeFeedScreen() {
  const videos = useAppStore((state) => state.videos);
  const following = useAppStore((state) => state.following);
  const notInterested = useAppStore((state) => state.notInterested);
  const setLoading = useAppStore((state) => state.setLoading);
  const hasMoreVideos = useAppStore((state) => state.hasMoreVideos);
  const loadMoreVideos = useAppStore((state) => state.loadMoreVideos);
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [loading, setLocalLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      setLocalLoading(false);
      setLoading(false);
    }, 900);
    return () => {
      window.clearTimeout(timer);
    };
  }, [setLoading]);

  const feedVideos = useMemo(() => {
    const base = videos.filter((video) => !notInterested[video.id]);
    if (activeTab === "following") {
      return base.filter((video) => following[video.userId]);
    }
    return base;
  }, [activeTab, following, notInterested, videos]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(index)) setActiveIndex(index);
      },
      { threshold: [0.45, 0.6, 0.75] }
    );

    itemRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [feedVideos]);

  useEffect(() => {
    const sentinel = loaderRef.current;
    if (!sentinel || !hasMoreVideos) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || isFetchingNextPage) return;

        setIsFetchingNextPage(true);
        fetchTimerRef.current = window.setTimeout(() => {
          loadMoreVideos();
          setIsFetchingNextPage(false);
        }, 220);
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (fetchTimerRef.current) {
        window.clearTimeout(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    };
  }, [hasMoreVideos, isFetchingNextPage, loadMoreVideos]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass sticky top-0 z-10 mb-3 rounded-[2rem] px-4 py-3">
          <div className="h-11 w-72 animate-pulse rounded-full bg-white/10" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-dvh rounded-[2.5rem] border border-border bg-white/5">
            <div className="h-full animate-pulse rounded-[2.5rem] bg-gradient-to-br from-white/5 via-white/10 to-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="glass sticky top-0 z-10 rounded-[2rem] px-4 py-3">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "for-you" | "following")}>
          <TabsList className="w-full">
            <TabsTrigger value="for-you" className="flex-1">For You</TabsTrigger>
            <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {feedVideos.length === 0 ? (
          <div className="glass flex min-h-[60vh] items-center justify-center rounded-[2.5rem] p-8 text-center">
            <div>
              <p className="text-xl font-semibold">Nothing to show yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Follow a few creators to populate the Following feed.</p>
            </div>
          </div>
        ) : (
          <>
            {feedVideos.map((video, index) => (
              <div
                key={video.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                data-index={index}
              >
                <VideoCard video={video} active={index === activeIndex} />
              </div>
            ))}
            <div ref={loaderRef} className="py-3 text-center text-sm text-muted-foreground">
              {hasMoreVideos ? "Loading more videos..." : "You're all caught up"}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
