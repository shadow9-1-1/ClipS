"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw, Volume2, VolumeX, Maximize2, Heart } from "lucide-react";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/utils";

let globallyPlayingVideo: HTMLVideoElement | null = null;
let globallyMuted = true;

type VideoPlayerProps = {
  video: Video;
  active: boolean;
  onDoubleTapLike: () => void;
};

export function VideoPlayer({ video, active, onDoubleTapLike }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(globallyMuted);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [burstCount, setBurstCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runtimeOrientation, setRuntimeOrientation] = useState<Video["orientation"]>(video.orientation);
  const wasActiveRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const muteHandledByPointerRef = useRef(false);

  useEffect(() => {
    setRuntimeOrientation(video.orientation);
  }, [video.id, video.orientation]);

  const applyMutedState = (element: HTMLVideoElement, muted: boolean) => {
    element.defaultMuted = muted;
    element.muted = muted;
    element.volume = muted ? 0 : 1;
    if (muted) {
      element.setAttribute("muted", "");
    } else {
      element.removeAttribute("muted");
    }
  };

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
    applyMutedState(element, globallyMuted);
    void element.play().catch(() => {
      // Some browsers reject early autoplay calls before media is ready.
    });
  };

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (active) {
      setIsMuted(globallyMuted);
      tryAutoPlay();
    } else {
      if (wasActiveRef.current) {
        shouldRestartRef.current = true;
        resetToStart(element);
      }
      element.pause();
      if (globallyPlayingVideo === element) {
        globallyPlayingVideo = null;
      }
    }
    wasActiveRef.current = active;
  }, [active, video.src]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    globallyMuted = isMuted;
    applyMutedState(element, isMuted);
    // If user unmutes the active video, retry play so audio starts immediately.
    if (!isMuted && active && element.paused) {
      void element.play().catch(() => {
        // Browser may still require another direct gesture.
      });
    }
  }, [active, isMuted]);

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

  const toggleMuted = async () => {
    const vid = videoRef.current;
    if (!vid) return;

    const nextMuted = !isMuted;
    globallyMuted = nextMuted;
    setIsMuted(nextMuted);

    // Apply immediately on the element so user gesture takes effect now.
    applyMutedState(vid, nextMuted);

    if (!nextMuted) {
      try {
        await vid.play();
        setIsPlaying(true);
      } catch {
        // Some browsers still block until another explicit play tap.
      }
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

  const objectFit = "object-contain";

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
        loop
        preload="metadata"
        onLoadedData={(event) => {
          const element = event.currentTarget;
          if (element.videoWidth > 0 && element.videoHeight > 0) {
            setRuntimeOrientation(
              element.videoWidth >= element.videoHeight ? "landscape" : "portrait"
            );
          }
          applyMutedState(event.currentTarget, globallyMuted);
          if (active) {
            tryAutoPlay();
          }
        }}
        onCanPlay={(event) => {
          applyMutedState(event.currentTarget, globallyMuted);
          if (active) {
            tryAutoPlay();
          }
        }}
        onTimeUpdate={(event) => {
          const target = event.currentTarget;
          if (!target.duration) return;
          setProgress(target.currentTime / target.duration);
        }}
        onPlay={(event) => {
          const current = event.currentTarget;
          if (globallyPlayingVideo && globallyPlayingVideo !== current) {
            try {
              globallyPlayingVideo.pause();
            } catch {
              // ignore pause failures
            }
          }
          globallyPlayingVideo = current;
          setIsPlaying(true);
        }}
        onPause={(event) => {
          if (globallyPlayingVideo === event.currentTarget) {
            globallyPlayingVideo = null;
          }
          setIsPlaying(false);
        }}
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
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              muteHandledByPointerRef.current = true;
              void toggleMuted();
            }}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (muteHandledByPointerRef.current) {
                muteHandledByPointerRef.current = false;
                return;
              }
              await toggleMuted();
            }}
            className="glass pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition hover:scale-105"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <span className={cn("transition-colors", isMuted ? "text-white/90" : "text-primary") }>
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </span>
          </button>
          {runtimeOrientation === "landscape" ? (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={async (event) => {
                event.stopPropagation();
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
