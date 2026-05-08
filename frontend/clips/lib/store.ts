"use client";

import { useMemo } from "react";
import { create } from "zustand";
import {
  comments as mockComments,
  currentUserId,
  getUser,
  type Comment,
  type User,
  type Video,
} from "@/data/mock";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { fetchVideos, createPresignedUrl } from "@/lib/backend-client";
import { mapApiVideoToUi } from "@/lib/backend-adapters";

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
  isAuthed: boolean;
  isLoading: boolean;
  hasMoreVideos: boolean;
  error: ToastableError | null;
  toggleLike: (videoId: string) => void;
  setLiked: (videoId: string, liked: boolean) => void;
  toggleSave: (videoId: string) => void;
  rateVideo: (videoId: string, rating: number) => void;
  toggleFollow: (userId: string) => void;
  markNotInterested: (videoId: string) => void;
  reportVideo: (videoId: string, reason: string, details?: string) => void;
  addComment: (videoId: string, text: string) => void;
  addVideo: (video: Video | NewVideoInput) => void;
  updateProfile: (profile: ProfileEdits) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  loadMoreVideos: () => void;
  setAuthed: (isAuthed: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: ToastableError | null) => void;
};

const FEED_PAGE_SIZE = 6;

const initialLiked: Record<string, boolean> = {
  v1: true,
  v3: true,
  v5: true,
  v8: true,
};

const initialSaved: Record<string, boolean> = {
  v2: true,
  v4: true,
  v6: true,
  v9: true,
};

const initialFollowing: Record<string, boolean> = {
  u_nova: true,
  u_flux: true,
  u_glow: true,
};

function clampRating(value: number) {
  return Math.min(5, Math.max(1, Math.round(value)));
}

export const useAppStore = create<AppState>((set, get) => ({
  allVideos: [],
  videos: [],
  comments: mockComments.map((comment) => ({ ...comment })),
  liked: { ...initialLiked },
  saved: { ...initialSaved },
  ratings: {},
  following: { ...initialFollowing },
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

    set({
      saved: { ...saved, [videoId]: !active },
      videos: videos.map((video) =>
        video.id === videoId
          ? { ...video, saves: Math.max(0, video.saves + (active ? -1 : 1)) }
          : video
      ),
    });
  },
  rateVideo: (videoId, ratingValue) => {
    const rating = clampRating(ratingValue);
    const { ratings, videos } = get();
    const previousRating = ratings[videoId];

    set({
      ratings: { ...ratings, [videoId]: rating },
      videos: videos.map((video) => {
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
      }),
    });
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
      if (!res.ok) throw new Error("Follow request failed");
    } catch {
      set({ following: prev });
      set({ error: { title: "Follow failed", message: "Could not update follow. Please try again." } });
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
      userId: currentUserId,
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
          userId: currentUserId,
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
  updateProfile: (profile) => {
    set(({ profileEdits }) => ({
      profileEdits: {
        ...profileEdits,
        [currentUserId]: {
          ...profileEdits[currentUserId],
          ...profile,
        },
      },
    }));
  },
  updateSettings: (settings) => {
    set(({ settings: current }) => ({ settings: { ...current, ...settings } }));
  },
  loadMoreVideos: async () => {
    const { hasMoreVideos, isLoading, videos } = get();
    if (!hasMoreVideos || isLoading) return;

    set({ isLoading: true });
    try {
      const skip = videos.length;
      const response = await fetchVideos(FEED_PAGE_SIZE, skip);
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
      set({ error: { title: "Feed error", message: "Could not load videos." } });
    } finally {
      set({ isLoading: false });
    }
  },
  setAuthed: (isAuthed) => set({ isAuthed }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export function useMyProfile() {
  const profileEdits = useAppStore((state) => state.profileEdits[currentUserId]);
  const following = useAppStore((state) => state.following);

  return useMemo(() => {
    const base = getUser(currentUserId);
    const edits = profileEdits ?? {};
    return {
      ...base,
      ...edits,
      followingCount: Object.values(following).filter(Boolean).length,
    };
  }, [profileEdits, following]);
}
