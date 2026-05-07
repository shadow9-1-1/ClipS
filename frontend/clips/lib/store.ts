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
  videos as mockVideos,
} from "@/data/mock";

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

export type AppState = {
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
  error: ToastableError | null;
  toggleLike: (videoId: string) => void;
  setLiked: (videoId: string, liked: boolean) => void;
  toggleSave: (videoId: string) => void;
  rateVideo: (videoId: string, rating: number) => void;
  toggleFollow: (userId: string) => void;
  markNotInterested: (videoId: string) => void;
  reportVideo: (videoId: string, reason: string, details?: string) => void;
  addComment: (videoId: string, text: string) => void;
  addVideo: (video: Omit<Video, "id" | "likes" | "commentCount" | "shares" | "saves" | "rating" | "ratingCount" | "createdAt" | "userId"> & { src: string; poster: string; orientation: Video["orientation"] }) => void;
  updateProfile: (profile: ProfileEdits) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setAuthed: (isAuthed: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: ToastableError | null) => void;
};

const cloneVideos = () => mockVideos.map((video) => ({ ...video }));

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
  videos: cloneVideos(),
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
  isLoading: true,
  error: null,
  toggleLike: (videoId) => {
    const { liked, videos } = get();
    const active = Boolean(liked[videoId]);

    set({
      liked: { ...liked, [videoId]: !active },
      videos: videos.map((video) =>
        video.id === videoId
          ? { ...video, likes: Math.max(0, video.likes + (active ? -1 : 1)) }
          : video
      ),
    });
  },
  setLiked: (videoId, likedValue) => {
    const { liked, videos } = get();
    const active = Boolean(liked[videoId]);
    if (active === likedValue) return;

    set({
      liked: { ...liked, [videoId]: likedValue },
      videos: videos.map((video) =>
        video.id === videoId
          ? { ...video, likes: Math.max(0, video.likes + (likedValue ? 1 : -1)) }
          : video
      ),
    });
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
  toggleFollow: (userId) => {
    const { following } = get();
    set({ following: { ...following, [userId]: !following[userId] } });
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
    const nextVideo: Video = {
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

    set(({ videos }) => ({ videos: [nextVideo, ...videos] }));
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
