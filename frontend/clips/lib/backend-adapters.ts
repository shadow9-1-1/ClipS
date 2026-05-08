import type { User, Video } from "@/data/mock";
import { buildAvatarFromUsername, buildPosterFromTitle, getFallbackVideoSrc } from "@/lib/placeholders";

export type ApiUser = {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  bio?: string | null;
  avatarKey?: string | null;
};

export type ApiVideo = {
  _id?: string;
  title?: string;
  description?: string;
  videoURL?: string;
  videoObjectKey?: string;
  duration?: number;
  owner?: { _id?: string; username?: string; avatarKey?: string | null } | string;
  averageRating?: number;
  reviewCount?: number;
  recentEngagement?: number;
  createdAt?: string;
};

export function mapApiUserToUi(user: ApiUser): User {
  const id = String(user.id || user._id || "");
  const username = (user.username || "user").toLowerCase();

  return {
    id,
    username,
    displayName: username,
    avatar: buildAvatarFromUsername(username),
    bio: user.bio || "",
    verified: false,
    followers: 0,
    following: 0,
  };
}

function extractTags(description?: string): string[] {
  if (!description) return [];
  const tags = description.match(/#[a-z0-9_]+/gi) || [];
  return tags.slice(0, 5);
}

export function mapApiVideoToUi(video: ApiVideo): Video {
  let ownerId = "";
  if (video.owner && typeof video.owner === "object" && video.owner._id) {
    ownerId = String(video.owner._id);
  } else if (typeof video.owner === "string") {
    ownerId = video.owner;
  }

  const caption = video.title || video.description || "Untitled clip";
  const tags = extractTags(video.description);

  return {
    id: String(video._id || ""),
    userId: ownerId,
    caption,
    music: "Original audio",
    tags,
    orientation: "portrait",
    src: video.videoURL || getFallbackVideoSrc(),
    poster: buildPosterFromTitle(video.title || "Clip"),
    likes: Math.max(0, Number(video.recentEngagement || 0)),
    commentCount: Math.max(0, Number(video.reviewCount || 0)),
    shares: 0,
    saves: 0,
    rating: Number(video.averageRating || 0),
    ratingCount: Math.max(0, Number(video.reviewCount || 0)),
    duration: Number(video.duration || 0),
    createdAt: video.createdAt || new Date().toISOString(),
  };
}
