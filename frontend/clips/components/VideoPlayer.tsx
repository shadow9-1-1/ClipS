"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw, Volume2, VolumeX, Maximize2, Heart } from "lucide-react";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  video: Video;
  active: boolean;
  onDoubleTapLike: () => void;
};

export function VideoPlayer({ video, active, onDoubleTapLike }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [burstCount, setBurstCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wasActiveRef = useRef(false);
  const shouldRestartRef = useRef(false);

  const resetToStart = (element: HTMLVideoElement) => {
    try {
      element.currentTime = 0;
    } catch {
      const resetOnMetadata = () => {
        try {
          element.currentTime = 0;
        } catch {
          // keep current position if browser still blocks seeking
        }
      };
      element.addEventListener("loadedmetadata", resetOnMetadata, { once: true });
    }
  };

  const tryAutoPlay = () => {
    const element = videoRef.current;
    if (!element || !active) return;
    if (shouldRestartRef.current) {
      resetToStart(element);
      shouldRestartRef.current = false;
    }
    element.muted = isMuted;
    void element.play().catch(() => {
      // Some browsers reject early autoplay calls before media is ready.
    });
  };

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (active) {
      tryAutoPlay();
    } else {
      if (wasActiveRef.current) {
        shouldRestartRef.current = true;
        resetToStart(element);
      }
      element.pause();
    }
    wasActiveRef.current = active;
  }, [active, video.src]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.muted = isMuted;
    element.volume = isMuted ? 0 : 1;
  }, [isMuted]);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const togglePlay = () => {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      void element.play().catch(() => undefined);
      setIsPlaying(true);
    } else {
      element.pause();
      setIsPlaying(false);
    }
  };

  const requestFullscreen = async () => {
    const element = videoRef.current ?? wrapperRef.current;
    if (!element) return;

    const fullscreenElement = document.fullscreenElement;
    if (fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      return;
    }

    const webkitElement = element as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitEnterFullScreen?: () => void;
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    if (typeof webkitElement.webkitEnterFullscreen === "function") {
      webkitElement.webkitEnterFullscreen();
      return;
    }

    if (typeof webkitElement.webkitEnterFullScreen === "function") {
      webkitElement.webkitEnterFullScreen();
      return;
    }

    if (typeof webkitElement.webkitRequestFullscreen === "function") {
      await webkitElement.webkitRequestFullscreen();
      return;
    }

    if ("requestFullscreen" in element) {
      await element.requestFullscreen();
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    const distance = Math.hypot(event.clientX - lastTapRef.current.x, event.clientY - lastTapRef.current.y);
    const isDoubleTap = now - lastTapRef.current.time < 280 && distance < 24;
    lastTapRef.current = { time: now, x: event.clientX, y: event.clientY };

    const target = event.target as Element | null;
    if (target && target.closest("button, a, [role='button']")) {
      // Click landed on a control; treat as handled by that control.
      return;
    }

    if (isDoubleTap) {
      onDoubleTapLike();
      setBurstCount((count) => count + 1);
      lastTapRef.current = { time: 0, x: 0, y: 0 };
      return;
    }

    togglePlay();
  };

  const objectFit = video.orientation === "landscape" ? "object-contain" : "object-cover";

  return (
    <div
      ref={wrapperRef}
      onPointerUp={onPointerUp}
      className="absolute inset-0 overflow-hidden"
    >
      <video
        ref={videoRef}
        className={cn("h-full w-full bg-black", objectFit)}
        src={video.src}
        poster={video.poster}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onLoadedData={() => {
          if (active) {
            tryAutoPlay();
          }
        }}
        onCanPlay={() => {
          if (active) {
            tryAutoPlay();
          }
        }}
        onTimeUpdate={(event) => {
          const target = event.currentTarget;
          if (!target.duration) return;
          setProgress(target.currentTime / target.duration);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="glass pointer-events-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-foreground/90">
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          Double tap to like
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async (event) => {
              event.preventDefault();
              const vid = videoRef.current;
              if (!vid) return;
              const newMuted = !vid.muted;
              try {
                vid.muted = newMuted;
                vid.volume = newMuted ? 0 : 1;
                if (!newMuted) {
                  await vid.play();
                }
              } catch {
                // ignore
              }
              setIsMuted(newMuted);
            }}
            className="glass pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition hover:scale-105"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <span className={cn("transition-colors", isMuted ? "text-white/90" : "text-primary") }>
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </span>
          </button>
          {video.orientation === "landscape" ? (
            <button
              type="button"
              onClick={async (event) => {
                event.preventDefault();
                try {
                  const vid = videoRef.current;
                  if (vid && (vid as any).requestFullscreen) {
                    await (vid as any).requestFullscreen();
                    return;
                  }
                  await requestFullscreen();
                } catch {
                  // ignore
                }
              }}
              className="glass pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition hover:scale-105"
              aria-label="Fullscreen video"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            togglePlay();
          }}
          className={cn(
            "pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/90 shadow-soft backdrop-blur-sm transition",
            isPlaying ? "opacity-80" : "opacity-100"
          )}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 translate-x-0.5" />}
        </button>
      </div>

      <progress
        className="video-progress absolute inset-x-0 bottom-0 h-1 w-full"
        value={Math.max(0, Math.min(100, progress * 100))}
        max={100}
        aria-label="Video progress"
      />

      <AnimatePresence>
        {burstCount > 0 ? (
          <motion.div
            key={burstCount}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.18, 1.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded-full bg-primary/20 p-8 text-primary shadow-soft backdrop-blur-sm">
              <Heart className="h-12 w-12 fill-current" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
