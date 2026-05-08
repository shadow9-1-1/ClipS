"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { VideoFeedDialog } from "@/components/VideoFeedDialog";
import { useApiUser } from "@/hooks/useApiUser";
import { useEffect } from "react";

export function ExploreScreen() {
  const videos = useAppStore((state) => state.allVideos);
  const notInterested = useAppStore((state) => state.notInterested);
  const loadMoreVideos = useAppStore((state) => state.loadMoreVideos);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (videos.length === 0) {
      void loadMoreVideos();
    }
  }, [loadMoreVideos, videos.length]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return videos.filter((video) => {
      if (notInterested[video.id]) return false;
      if (!term) return true;
      return [video.caption, video.music, ...video.tags]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [notInterested, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="glass rounded-[2.5rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Explore</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Find a mood, frame, or creator.</h1>
          </div>
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search captions, music, tags, creators"
              className="h-12 w-full rounded-full border border-border bg-background/80 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((video, index) => (
          <button
            key={video.id}
            type="button"
            onClick={() => {
              setSelectedIndex(index);
              setDialogOpen(true);
            }}
            className="group overflow-hidden rounded-[2.5rem] border border-border bg-white/5 text-left transition hover:-translate-y-1 hover:bg-white/10"
          >
            <div className="relative aspect-[9/12] overflow-hidden">
              <img src={video.poster} alt={video.caption} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <CreatorLine userId={video.userId} />
                <p className="line-clamp-2 text-sm text-white/80">{video.caption}</p>
              </div>
            </div>
          </button>
        ))}
      </section>

      <VideoFeedDialog open={dialogOpen} onOpenChange={setDialogOpen} videos={filtered} startIndex={selectedIndex} />
    </motion.div>
  );
}

function CreatorLine({ userId }: { userId: string }) {
  const { user } = useApiUser(userId);
  if (!user) {
    return <p className="text-sm font-semibold">Creator</p>;
  }
  return <p className="text-sm font-semibold">{user.displayName}</p>;
}
