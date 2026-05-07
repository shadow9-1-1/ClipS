"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Video } from "@/data/mock";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { VideoCard } from "@/components/VideoCard";

type VideoFeedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: Video[];
  startIndex: number;
};

export function VideoFeedDialog({ open, onOpenChange, videos, startIndex }: VideoFeedDialogProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(startIndex);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(startIndex);
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: startIndex * window.innerHeight, behavior: "instant" as ScrollBehavior });
    });
  }, [open, startIndex]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
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
  }, [open, videos]);

  const items = useMemo(() => videos, [videos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-dvh w-dvw max-w-none rounded-none border-none bg-background p-0">
        <DialogClose className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60">
          <X className="h-5 w-5" />
        </DialogClose>
        <div ref={containerRef} className="h-full overflow-y-auto no-scrollbar scroll-snap-y">
          {items.map((video, index) => (
            <div
              key={video.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-index={index}
              className="h-dvh w-full"
            >
              <VideoCard video={video} active={index === activeIndex} compact />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
