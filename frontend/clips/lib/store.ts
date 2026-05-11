"use client";

import { useMemo } from "react";
import { create } from "zustand";
import type { Comment, User, Video } from "@/lib/types";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import {
  fetchFollowingFeed,
  fetchTrendingFeed,
  createPresignedUrl,
} from "@/lib/backend-client";
import { mapApiVideoToUi } from "@/lib/backend-adapters";
import { buildAvatarFromUsername } from "@/lib/placeholders";

type ToastableError = {
  title: string;
  message: string;
};

type Settings = {
  autoScroll: boolean;
  notifications: boolean;
  privateAccount: boolean;
  reduceData: boolean;
  language: string;
};

type ReportRecord = {
  reason: string;
  details?: string;
  createdAt: string;
};

type ProfileEdits = Partial<Pick<User, "avatar" | "bio" | "displayName" | "username">>;

type NewVideoInput = Omit<
  Video,
  "id" | "likes" | "commentCount" | "shares" | "saves" | "rating" | "ratingCount" | "createdAt" | "userId"
> & {
  src: string;
  poster: string;
  orientation: Video["orientation"];
};

export type AppState = {
  allVideos: Video[];
  videos: Video[];
  comments: Comment[];
  liked: Record<string, boolean>;
  saved: Record<string, boolean>;
  ratings: Record<string, number>;
  following: Record<string, boolean>;
  notInterested: Record<string, boolean>;
  reported: Record<string, ReportRecord>;
  profileEdits: Record<string, ProfileEdits>;
  settings: Settings;
  feedMode: "for-you" | "following";
  isAuthed: boolean;
  isLoading: boolean;
  hasMoreVideos: boolean;
  error: ToastableError | null;
  toggleLike: (videoId: string) => void;
  setLiked: (videoId: string, liked: boolean) => void;
  toggleSave: (videoId: string) => void;
  rateVideo: (videoId: string, rating: number) => Promise<void>;
  toggleFollow: (userId: string) => void;
  markNotInterested: (videoId: string) => void;
  reportVideo: (videoId: string, reason: string, details?: string) => void;
  addComment: (videoId: string, text: string) => void;
  addVideo: (video: Video | NewVideoInput) => void;
  editVideoLocal: (videoId: string, updates: Partial<Pick<Video, "caption" | "tags">>) => void;
  removeVideoLocal: (videoId: string) => void;
  updateProfile: (profile: ProfileEdits) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  loadFollowingFromServer: (viewerId: string) => Promise<void>;
  loadVideoInteractionsFromServer: () => Promise<void>;
  setFeedMode: (mode: "for-you" | "following") => void;
  loadMoreVideos: () => void;
  setAuthed: (isAuthed: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: ToastableError | null) => void;
};

const FEED_PAGE_SIZE = 6;
const LOCAL_CURRENT_USER_ID = "me";
let feedRetryAt = 0;
let interactionsEndpointsAvailable: boolean | null = null;

function clampRating(value: number) {
  return Math.min(5, Math.max(1, Math.round(value)));
}

export const useAppStore = create<AppState>((set, get) => ({
  allVideos: [],
  videos: [],
  comments: [],
  liked: {},
  saved: {},
  ratings: {},
  following: {},
  notInterested: {},
  reported: {},
  profileEdits: {},
  settings: {
    autoScroll: true,
    notifications: true,
    privateAccount: false,
    reduceData: false,
    language: "English",
  },
  feedMode: "for-you",
  isAuthed: true,
  isLoading: false,
  hasMoreVideos: true,
  error: null,
  toggleLike: (videoId) => {
    const { liked } = get();
    const next = !liked[videoId];
    void get().setLiked(videoId, next);
  },
  setLiked: async (videoId, likedValue) => {
    const { liked, videos } = get();
    const active = Boolean(liked[videoId]);
    if (active === likedValue) return;

    const prev = { liked: { ...liked }, videos: [...videos] };
    set({
      liked: { ...liked, [videoId]: likedValue },
      videos: videos.map((video) =>
        video.id === videoId
          ? { ...video, likes: Math.max(0, video.likes + (likedValue ? 1 : -1)) }
          : video
      ),
    });

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      set({ liked: prev.liked, videos: prev.videos });
      set({ error: { title: "Sign in required", message: "Please sign in to like videos." } });
      return;
    }

    try {
      const method = likedValue ? "POST" : "DELETE";
      const res = await fetch(`${getApiPrefix()}/v1/videos/${videoId}/likes`, {
        method,
        headers: { ...auth },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Like request failed");
      }
    } catch {
      set({ liked: prev.liked, videos: prev.videos });
      set({ error: { title: "Like failed", message: "Could not update like. Please try again." } });
    }
  },
  toggleSave: (videoId) => {
    const { saved, videos } = get();
    const active = Boolean(saved[videoId]);
    const prev = { saved: { ...saved }, videos: [...videos] };

    set({
      saved: { ...saved, [videoId]: !active },
      videos: videos.map((video) =>
        video.id === videoId
          ? { ...video, saves: Math.max(0, video.saves + (active ? -1 : 1)) }
          : video
      ),
    });

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      set({ saved: prev.saved, videos: prev.videos });
      set({ error: { title: "Sign in required", message: "Please sign in to save videos." } });
      return;
    }

    void (async () => {
      try {
        const method = active ? "DELETE" : "POST";
        const endpoints = [
          `${getApiPrefix()}/v1/videos/${videoId}/saves`,
          `${getApiPrefix()}/v1/videos/${videoId}/save`,
        ];

        let finalErrorMessage = "Save request failed";
        let matched = false;
        for (const endpoint of endpoints) {
          const res = await fetch(endpoint, {
            method,
            credentials: "include",
            headers: { ...auth },
          });
          if (res.ok) {
            matched = true;
            break;
          }

          const body = (await res.json().catch(() => ({}))) as { message?: string };
          finalErrorMessage = body?.message || `Save request failed (${res.status})`;

          // Keep trying fallback paths when route is missing.
          if (res.status !== 404) {
            break;
          }
        }

        if (!matched) {
          throw new Error(finalErrorMessage);
        }
      } catch (err) {
        set({ saved: prev.saved, videos: prev.videos });
        set({
          error: {
            title: "Save failed",
            message:
              err instanceof Error && err.message
                ? err.message
                : "Could not update saved videos. Please try again.",
          },
        });
      }
    })();
  },
  rateVideo: async (videoId, ratingValue) => {
    const rating = clampRating(ratingValue);
    const { ratings, videos, allVideos } = get();
    const previousRating = ratings[videoId];
    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      set({ error: { title: "Sign in required", message: "Please sign in to rate videos." } });
      return;
    }

    const applyRatingToVideo = (video: Video) => {
      if (video.id !== videoId) return video;
      const totalBefore = video.rating * video.ratingCount;
      const totalAfter = previousRating
        ? totalBefore - previousRating + rating
        : totalBefore + rating;
      const countAfter = previousRating ? video.ratingCount : video.ratingCount + 1;
      return {
        ...video,
        rating: totalAfter / countAfter,
        ratingCount: countAfter,
      };
    };

    const prev = {
      ratings: { ...ratings },
      videos: [...videos],
      allVideos: [...allVideos],
    };
    set({
      ratings: { ...ratings, [videoId]: rating },
      videos: videos.map(applyRatingToVideo),
      allVideos: allVideos.map(applyRatingToVideo),
    });

    try {
      const res = await fetch(`${getApiPrefix()}/v1/videos/${videoId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...auth,
        },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body?.message || "Could not save rating.");
      }
      const body = (await res.json().catch(() => ({}))) as {
        data?: { averageRating?: number; ratingCount?: number };
      };
      const averageRating = Number(body?.data?.averageRating);
      const ratingCount = Number(body?.data?.ratingCount);
      if (Number.isFinite(averageRating) && Number.isFinite(ratingCount) && ratingCount >= 0) {
        const applyServerStats = (video: Video) =>
          video.id === videoId
            ? { ...video, rating: averageRating, ratingCount }
            : video;
        const current = get();
        set({
          videos: current.videos.map(applyServerStats),
          allVideos: current.allVideos.map(applyServerStats),
        });
      }
    } catch (err) {
      set({
        ratings: prev.ratings,
        videos: prev.videos,
        allVideos: prev.allVideos,
        error: {
          title: "Rating failed",
          message: err instanceof Error ? err.message : "Could not save rating. Please try again.",
        },
      });
    }
  },
  toggleFollow: async (userId) => {
    const { following } = get();
    const next = !following[userId];
    const prev = { ...following };
    set({ following: { ...following, [userId]: next } });

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      set({ following: prev });
      set({ error: { title: "Sign in required", message: "Please sign in to follow creators." } });
      return;
    }

    try {
      const method = next ? "POST" : "DELETE";
      const res = await fetch(
        `${getApiPrefix()}/v1/users/${userId}/${next ? "follow" : "unfollow"}`,
        {
          method,
          headers: { ...auth },
          credentials: "include",
        }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body?.message || "Follow request failed");
      }
    } catch (err) {
      set({ following: prev });
      set({
        error: {
          title: "Follow failed",
          message:
            err instanceof Error && err.message
              ? err.message
              : "Could not update follow. Please try again.",
        },
      });
    }
  },
  markNotInterested: (videoId) => {
    const { notInterested } = get();
    set({ notInterested: { ...notInterested, [videoId]: true } });
  },
  reportVideo: (videoId, reason, details) => {
    const { reported } = get();
    set({
      reported: {
        ...reported,
        [videoId]: {
          reason,
          details,
          createdAt: new Date().toISOString(),
        },
      },
    });
  },
  addComment: (videoId, text) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      videoId,
      userId: LOCAL_CURRENT_USER_ID,
      text,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    set(({ comments, videos }) => ({
      comments: [newComment, ...comments],
      videos: videos.map((video) =>
        video.id === videoId
          ? { ...video, commentCount: video.commentCount + 1 }
          : video
      ),
    }));
  },
  addVideo: (video) => {
    const createdAt = new Date().toISOString();
    const nextVideo: Video = "id" in video
      ? {
          ...video,
          createdAt: video.createdAt || createdAt,
          likes: video.likes || 0,
          commentCount: video.commentCount || 0,
          shares: video.shares || 0,
          saves: video.saves || 0,
          rating: video.rating || 0,
          ratingCount: video.ratingCount || 0,
        }
      : {
          id: `v_${Date.now()}`,
          userId: LOCAL_CURRENT_USER_ID,
          caption: video.caption,
          music: video.music,
          tags: video.tags,
          orientation: video.orientation,
          src: video.src,
          poster: video.poster,
          likes: 0,
          commentCount: 0,
          shares: 0,
          saves: 0,
          rating: 0,
          ratingCount: 0,
          duration: 30,
          createdAt,
        };

    set(({ allVideos, videos }) => ({
      allVideos: [nextVideo, ...allVideos],
      videos: [nextVideo, ...videos],
      hasMoreVideos: true,
    }));
  },
  editVideoLocal: (videoId, updates) => {
    const applyUpdates = (video: Video) =>
      video.id === videoId
        ? {
            ...video,
            ...(typeof updates.caption === "string" ? { caption: updates.caption } : {}),
            ...(Array.isArray(updates.tags) ? { tags: updates.tags } : {}),
          }
        : video;

    set(({ videos, allVideos }) => ({
      videos: videos.map(applyUpdates),
      allVideos: allVideos.map(applyUpdates),
    }));
  },
  removeVideoLocal: (videoId) => {
    set(({ videos, allVideos, liked, saved, ratings, notInterested, reported }) => {
      const nextLiked = { ...liked };
      const nextSaved = { ...saved };
      const nextRatings = { ...ratings };
      const nextNotInterested = { ...notInterested };
      const nextReported = { ...reported };
      delete nextLiked[videoId];
      delete nextSaved[videoId];
      delete nextRatings[videoId];
      delete nextNotInterested[videoId];
      delete nextReported[videoId];

      return {
        videos: videos.filter((video) => video.id !== videoId),
        allVideos: allVideos.filter((video) => video.id !== videoId),
        comments: get().comments.filter((comment) => comment.videoId !== videoId),
        liked: nextLiked,
        saved: nextSaved,
        ratings: nextRatings,
        notInterested: nextNotInterested,
        reported: nextReported,
      };
    });
  },
  updateProfile: (profile) => {
    set(({ profileEdits }) => ({
      profileEdits: {
        ...profileEdits,
        [LOCAL_CURRENT_USER_ID]: {
          ...profileEdits[LOCAL_CURRENT_USER_ID],
          ...profile,
        },
      },
    }));
  },
  updateSettings: (settings) => {
    set(({ settings: current }) => ({ settings: { ...current, ...settings } }));
  },
  loadFollowingFromServer: async (viewerId) => {
    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth) || !viewerId) return;

    try {
      const res = await fetch(`${getApiPrefix()}/v1/users/${viewerId}/following`, {
        method: "GET",
        credentials: "include",
        headers: { ...auth },
        cache: "no-store",
      });
      if (!res.ok) return;
      const body = (await res.json().catch(() => ({}))) as {
        data?: { following?: Array<{ id?: string; _id?: string }> };
      };
      const nextFollowing: Record<string, boolean> = {};
      for (const row of body?.data?.following ?? []) {
        const id = String(row?.id || row?._id || "");
        if (id) nextFollowing[id] = true;
      }
      set({ following: nextFollowing });
    } catch {
      // keep existing map on network failure
    }
  },
  loadVideoInteractionsFromServer: async () => {
    if (interactionsEndpointsAvailable === false) return;
    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) return;

    try {
      const [likedRes, savedRes] = await Promise.all([
        fetch(`${getApiPrefix()}/v1/users/me/liked-videos`, {
          method: "GET",
          credentials: "include",
          headers: { ...auth },
          cache: "no-store",
        }),
        fetch(`${getApiPrefix()}/v1/users/me/saved-videos`, {
          method: "GET",
          credentials: "include",
          headers: { ...auth },
          cache: "no-store",
        }),
      ]);

      if (likedRes.status === 404 || savedRes.status === 404) {
        interactionsEndpointsAvailable = false;
        return;
      }
      if (!likedRes.ok || !savedRes.ok) return;
      interactionsEndpointsAvailable = true;

      const likedBody = (await likedRes.json().catch(() => ({}))) as {
        data?: { videoIds?: string[] };
      };
      const savedBody = (await savedRes.json().catch(() => ({}))) as {
        data?: { videoIds?: string[] };
      };

      const likedMap: Record<string, boolean> = {};
      const savedMap: Record<string, boolean> = {};
      for (const id of likedBody?.data?.videoIds ?? []) {
        if (id) likedMap[String(id)] = true;
      }
      for (const id of savedBody?.data?.videoIds ?? []) {
        if (id) savedMap[String(id)] = true;
      }

      set({ liked: likedMap, saved: savedMap });
    } catch {
      // keep current local state on network failure
    }
  },
  setFeedMode: (mode) => {
    const { feedMode } = get();
    if (feedMode === mode) return;
    set({
      feedMode: mode,
      videos: [],
      allVideos: [],
      hasMoreVideos: true,
      error: null,
    });
    void get().loadMoreVideos();
  },
  loadMoreVideos: async () => {
    const { hasMoreVideos, isLoading, videos, feedMode } = get();
    if (Date.now() < feedRetryAt) return;
    if (!hasMoreVideos || isLoading) return;

    set({ isLoading: true });
    try {
      const skip = videos.length;
      const response =
        feedMode === "following"
          ? await fetchFollowingFeed(FEED_PAGE_SIZE, skip)
          : await fetchTrendingFeed(FEED_PAGE_SIZE, skip);
      const raw = (response?.data?.videos || []) as any[];
      const total = typeof response?.total === "number" ? response.total : 0;
      const mapped = raw.map(mapApiVideoToUi).filter((v) => v.id);

      await Promise.all(
        raw.map(async (apiVideo, index) => {
          if (!mapped[index]) return;
          if (apiVideo?.videoURL || !apiVideo?.videoObjectKey) return;
          try {
            const presigned = await createPresignedUrl(apiVideo.videoObjectKey);
            const accessUrl = presigned?.data?.accessUrl;
            if (accessUrl) {
              mapped[index] = {
                ...mapped[index],
                src: accessUrl,
              };
            }
          } catch {
            // keep fallback src
          }
        })
      );

      const nextVideos = [...videos, ...mapped];
      const more = total > 0 ? nextVideos.length < total : mapped.length === FEED_PAGE_SIZE;

      set({
        videos: nextVideos,
        allVideos: nextVideos,
        hasMoreVideos: more,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const isRateLimited = /429|too many/i.test(message);
      if (isRateLimited) {
        feedRetryAt = Date.now() + 5000;
        // Avoid noisy popups; this is transient and auto-recovers.
        set({ error: null });
      } else {
        set({ error: { title: "Feed error", message: "Could not load videos." } });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  setAuthed: (isAuthed) => set({ isAuthed }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export function useMyProfile() {
  const profileEdits = useAppStore((state) => state.profileEdits[LOCAL_CURRENT_USER_ID]);
  const following = useAppStore((state) => state.following);

  return useMemo(() => {
    const edits = profileEdits ?? {};
    return {
      id: LOCAL_CURRENT_USER_ID,
      username: edits.username || "me",
      displayName: edits.displayName || "My Profile",
      avatar: edits.avatar || buildAvatarFromUsername(edits.username || "me"),
      bio: edits.bio || "",
      verified: false,
      followers: 0,
      following: 0,
      ...edits,
      followingCount: Object.values(following).filter(Boolean).length,
    };
  }, [profileEdits, following]);
}
