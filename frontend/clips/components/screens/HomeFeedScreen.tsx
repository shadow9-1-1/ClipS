"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { VideoCard } from "@/components/VideoCard";
import { useAuth } from "@/hooks/useAuth";

export function HomeFeedScreen() {
  const { user: authUser } = useAuth();
  const videos = useAppStore((state) => state.videos);
  const notInterested = useAppStore((state) => state.notInterested);
  const feedMode = useAppStore((state) => state.feedMode);
  const setFeedMode = useAppStore((state) => state.setFeedMode);
  const autoScrollEnabled = useAppStore((state) => state.settings.autoScroll);
  const isLoading = useAppStore((state) => state.isLoading);
  const hasMoreVideos = useAppStore((state) => state.hasMoreVideos);
  const loadMoreVideos = useAppStore((state) => state.loadMoreVideos);
  const loadFollowingFromServer = useAppStore((state) => state.loadFollowingFromServer);
  const loadVideoInteractionsFromServer = useAppStore((state) => state.loadVideoInteractionsFromServer);
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isScrollSettled, setIsScrollSettled] = useState(true);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchTimerRef = useRef<number | null>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const autoScrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Always return to default home feed when landing on Home.
    setActiveTab("for-you");
    setFeedMode("for-you");
  }, [setFeedMode]);

  useEffect(() => {
    void loadMoreVideos();
  }, [loadMoreVideos]);

  useEffect(() => {
    setFeedMode(activeTab);
  }, [activeTab, setFeedMode]);

  useEffect(() => {
    if (!authUser?.id) return;
    void loadFollowingFromServer(authUser.id);
    void loadVideoInteractionsFromServer();
  }, [authUser?.id, loadFollowingFromServer, loadVideoInteractionsFromServer]);

  const feedVideos = useMemo(() => {
    return videos.filter((video) => !notInterested[video.id]);
  }, [notInterested, videos]);

  useEffect(() => {
    const nodes = itemRefs.current;
    if (!nodes.length) return;

    let frameId = 0;
    const updateActiveByViewportCenter = () => {
      const viewportCenterY = window.innerHeight / 2;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      nodes.forEach((node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const isOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!isOnScreen) return;

        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenterY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setActiveIndex(bestIndex);
    };

    const onScrollOrResize = () => {
      setIsScrollSettled(false);
      if (scrollIdleTimerRef.current) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = window.setTimeout(() => {
        setIsScrollSettled(true);
      }, 220);

      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveByViewportCenter);
    };

    updateActiveByViewportCenter();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (scrollIdleTimerRef.current) {
        window.clearTimeout(scrollIdleTimerRef.current);
        scrollIdleTimerRef.current = null;
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [feedVideos.length]);

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

  useEffect(() => {
    if (autoScrollTimerRef.current) {
      window.clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    if (!autoScrollEnabled) return;
    if (!isScrollSettled) return;
    if (feedVideos.length < 2) return;
    if (activeIndex >= feedVideos.length - 1) return;

    autoScrollTimerRef.current = window.setTimeout(() => {
      if (document.hidden) return;
      const nextIndex = activeIndex + 1;
      const nextNode = itemRefs.current[nextIndex];
      if (!nextNode) return;
      nextNode.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 4000);

    return () => {
      if (autoScrollTimerRef.current) {
        window.clearTimeout(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };
  }, [activeIndex, autoScrollEnabled, feedVideos.length, isScrollSettled]);

  if (isLoading && feedVideos.length === 0) {
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
                <VideoCard
                  video={video}
                  active={index === activeIndex && isScrollSettled}
                />
              </div>
            ))}
            <div ref={loaderRef} className="py-3 text-center text-sm text-muted-foreground">
              {hasMoreVideos ? "Loading more videos..." : "You're all caught up"}
            </div>
            {!hasMoreVideos && feedMode === "following" && feedVideos.length === 0 ? (
              <div className="pb-4 text-center text-sm text-muted-foreground">
                No videos from creators you follow yet.
              </div>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
  );
}
