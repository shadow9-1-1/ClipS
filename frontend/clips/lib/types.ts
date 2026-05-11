export type Orientation = "portrait" | "landscape";

export type User = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
};

export type Video = {
  id: string;
  userId: string;
  caption: string;
  music: string;
  tags: string[];
  orientation: Orientation;
  src: string;
  poster: string;
  likes: number;
  commentCount: number;
  shares: number;
  saves: number;
  rating: number;
  ratingCount: number;
  duration: number;
  createdAt: string;
};

export type Comment = {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  likes: number;
  createdAt: string;
};
