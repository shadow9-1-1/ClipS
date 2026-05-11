"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Edit3, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoFeedDialog } from "@/components/VideoFeedDialog";
import { FollowListDialog } from "@/components/FollowListDialog";
import { useAuth } from "@/hooks/useAuth";
import { useApiUser, useApiUserByUsername } from "@/hooks/useApiUser";
import { mapApiUserToUi } from "@/lib/backend-adapters";
import { fetchFollowers, fetchFollowing } from "@/lib/backend-client";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { toast } from "sonner";

type ProfileScreenProps = {
  username?: string;
};

export function ProfileScreen({ username }: ProfileScreenProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const profileRef = username?.trim().replace(/^@/, "");
  const normalizedUsername = profileRef?.toLowerCase();
  const isObjectIdRef = Boolean(profileRef && /^[a-fA-F0-9]{24}$/.test(profileRef));
  const { user: apiUserByUsername } = useApiUserByUsername(isObjectIdRef ? undefined : normalizedUsername);
  const { user: apiUserById } = useApiUser(isObjectIdRef ? profileRef : undefined);
  const { user: apiCurrentUser } = useApiUser(authUser?.id);
  const ownProfile =
    !profileRef ||
    normalizedUsername === apiCurrentUser?.username?.toLowerCase() ||
    profileRef === apiCurrentUser?.id;
  const profile = ownProfile
    ? apiCurrentUser
    : (isObjectIdRef ? apiUserById : apiUserByUsername);
  const profileMissing = Boolean(profileRef) && !ownProfile && !profile;
  const likedMap = useAppStore((state) => state.liked);
  const savedMap = useAppStore((state) => state.saved);
  const followingMap = useAppStore((state) => state.following);
  const toggleFollow = useAppStore((state) => state.toggleFollow);
  const loadFollowingFromServer = useAppStore((state) => state.loadFollowingFromServer);
  const loadVideoInteractionsFromServer = useAppStore((state) => state.loadVideoInteractionsFromServer);
  const allVideos = useAppStore((state) => state.videos);
  const loadMoreVideos = useAppStore((state) => state.loadMoreVideos);
  const editVideoLocal = useAppStore((state) => state.editVideoLocal);
  const removeVideoLocal = useAppStore((state) => state.removeVideoLocal);
  const [tab, setTab] = useState("videos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<{ id: string; caption: string } | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [followers, setFollowers] = useState<ReturnType<typeof mapApiUserToUi>[]>([]);
  const [following, setFollowing] = useState<ReturnType<typeof mapApiUserToUi>[]>([]);

  useEffect(() => {
    if (allVideos.length === 0) {
      void loadMoreVideos();
    }
  }, [allVideos.length, loadMoreVideos]);

  const profileVideos = useMemo(
    () => allVideos.filter((video) => video.userId === profile?.id),
    [allVideos, profile?.id]
  );
  const likedVideos = useMemo(() => allVideos.filter((video) => likedMap[video.id]), [allVideos, likedMap]);
  const savedVideos = useMemo(() => allVideos.filter((video) => savedMap[video.id]), [allVideos, savedMap]);
  const videosLabel = `Videos (${profileVideos.length})`;
  const likedLabel = ownProfile ? `My likes (${likedVideos.length})` : `Liked (${likedVideos.length})`;
  const savedLabel = ownProfile ? `My saved (${savedVideos.length})` : `Saved (${savedVideos.length})`;
  const isSelfProfile = Boolean(authUser?.id && profile?.id && authUser.id === profile.id);
  const isFollowingProfile = Boolean(profile?.id && followingMap[profile.id]);

  useEffect(() => {
    // Keep your own profile on the canonical route after refresh/navigation.
    if (profileRef && ownProfile) {
      router.replace("/profile");
    }
  }, [ownProfile, profileRef, router]);

  useEffect(() => {
    if (!authUser?.id) return;
    void loadFollowingFromServer(authUser.id);
    void loadVideoInteractionsFromServer();
  }, [authUser?.id, loadFollowingFromServer, loadVideoInteractionsFromServer]);

  useEffect(() => {
    let cancelled = false;
    if (!profile?.id) return;

    const load = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetchFollowers(profile.id),
          fetchFollowing(profile.id),
        ]);
        const mappedFollowers = (followersRes?.data?.followers ?? []).map((u: any) =>
          mapApiUserToUi(u)
        );
        const mappedFollowing = (followingRes?.data?.following ?? []).map((u: any) =>
          mapApiUserToUi(u)
        );
        if (!cancelled) {
          setFollowers(mappedFollowers);
          setFollowing(mappedFollowing);
        }
      } catch {
        if (!cancelled) {
          setFollowers([]);
          setFollowing([]);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const selectedList = tab === "videos" ? profileVideos : tab === "liked" ? likedVideos : savedVideos;

  const handleStartEditVideo = (videoId: string, currentCaption: string) => {
    setEditingVideo({ id: videoId, caption: currentCaption });
    setEditingTitle(currentCaption);
  };

  const handleSaveEditedTitle = async () => {
    const videoId = editingVideo?.id;
    const previousCaption = editingVideo?.caption || "";
    const nextCaption = editingTitle.trim();
    if (!videoId) {
      setEditingVideo(null);
      return;
    }
    if (!nextCaption) {
      toast.error("Title cannot be empty.");
      return;
    }
    if (nextCaption === previousCaption) {
      setEditingVideo(null);
      setEditingTitle("");
      return;
    }

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      toast.error("Please sign in first.");
      return;
    }

    try {
      setSavingTitle(true);
      const res = await fetch(`${getApiPrefix()}/v1/videos/${videoId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...auth,
        },
        body: JSON.stringify({ title: nextCaption }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        toast.error(body?.message || `Edit failed (${res.status})`);
        return;
      }
      const tags = nextCaption
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean)
        .slice(0, 5)
        .map((word) => `#${word.replace(/[^a-z0-9_]/gi, "").toLowerCase()}`)
        .filter((tag) => tag.length > 1);
      editVideoLocal(videoId, { caption: nextCaption, tags });
      toast.success("Video title updated.");
      setEditingVideo(null);
      setEditingTitle("");
    } catch {
      toast.error("Network error while editing.");
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm("Delete this video permanently?")) return;
    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      toast.error("Please sign in first.");
      return;
    }

    try {
      const res = await fetch(`${getApiPrefix()}/v1/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { ...auth },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        toast.error(body?.message || `Delete failed (${res.status})`);
        return;
      }
      removeVideoLocal(videoId);
      toast.success("Video deleted.");
    } catch {
      toast.error("Network error while deleting.");
    }
  };

  if (profileMissing || !profile) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <section className="glass rounded-[2.5rem] p-8 text-center">
          <h1 className="text-2xl font-semibold">Profile not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The user you opened does not exist.</p>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
          >
            Go to your profile
          </button>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="glass rounded-[2.5rem] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <img src={profile.avatar} alt={profile.displayName} className="h-24 w-24 rounded-[2rem] border border-border object-cover shadow-soft" />
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">{profile.displayName}</h1>
                  {profile.verified ? <BadgeCheck className="h-5 w-5 text-primary" /> : null}
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <button type="button" onClick={() => setFollowDialogOpen(true)} className="rounded-full border border-border bg-white/5 px-4 py-2 transition hover:bg-white/10">
                  <span className="font-semibold text-foreground">{followers.length.toLocaleString()}</span> followers
                </button>
                <button type="button" onClick={() => setFollowDialogOpen(true)} className="rounded-full border border-border bg-white/5 px-4 py-2 transition hover:bg-white/10">
                  <span className="font-semibold text-foreground">{following.length.toLocaleString()}</span> following
                </button>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {ownProfile ? (
              <button
                type="button"
                onClick={() => router.push("/profile/edit")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
              >
                <Edit3 className="h-4 w-4" />
                Edit profile
              </button>
            ) : (
              !isSelfProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!profile?.id) return;
                    void toggleFollow(profile.id);
                  }}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
                >
                  <Users className="h-4 w-4" />
                  {isFollowingProfile ? "Following" : "Follow"}
                </button>
              ) : null
            )}
          </div>
        </div>
      </section>

      <section className="glass rounded-[2.5rem] p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="videos">{videosLabel}</TabsTrigger>
            <TabsTrigger value="liked">{likedLabel}</TabsTrigger>
            <TabsTrigger value="saved">{savedLabel}</TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <SectionLabel title="Your videos" description={ownProfile ? "Clips you posted to your profile." : `${profile.displayName}'s posted clips.`} />
            <Grid
              videos={profileVideos}
              canManage={ownProfile}
              onEditVideo={handleStartEditVideo}
              onDeleteVideo={handleDeleteVideo}
              onSelect={(index) => {
                setStartIndex(index);
                setDialogOpen(true);
              }}
            />
          </TabsContent>
          <TabsContent value="liked">
            <SectionLabel title={ownProfile ? "My likes" : "Liked videos"} description={ownProfile ? "Clips you have liked." : `${profile.displayName}'s liked clips.`} />
            <Grid
              videos={likedVideos}
              canManage={false}
              onEditVideo={handleStartEditVideo}
              onDeleteVideo={handleDeleteVideo}
              onSelect={(index) => {
                setStartIndex(index);
                setDialogOpen(true);
              }}
            />
          </TabsContent>
          <TabsContent value="saved">
            <SectionLabel title={ownProfile ? "My saved" : "Saved videos"} description={ownProfile ? "Clips you have saved for later." : `${profile.displayName}'s saved clips.`} />
            <Grid
              videos={savedVideos}
              canManage={false}
              onEditVideo={handleStartEditVideo}
              onDeleteVideo={handleDeleteVideo}
              onSelect={(index) => {
                setStartIndex(index);
                setDialogOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>
      </section>

      <VideoFeedDialog open={dialogOpen} onOpenChange={setDialogOpen} videos={selectedList} startIndex={startIndex} />
      <FollowListDialog open={followDialogOpen} onOpenChange={setFollowDialogOpen} followers={followers} following={following} title={`${profile.displayName}'s network`} />
      <Dialog
        open={Boolean(editingVideo)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingVideo(null);
            setEditingTitle("");
            setSavingTitle(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit video title</DialogTitle>
            <DialogDescription>Update the title shown on your profile and feed.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <input
              type="text"
              value={editingTitle}
              onChange={(event) => setEditingTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSaveEditedTitle();
                }
              }}
              maxLength={120}
              autoFocus
              placeholder="Enter a new title"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingVideo(null);
                  setEditingTitle("");
                  setSavingTitle(false);
                }}
                className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingTitle}
                onClick={() => {
                  void handleSaveEditedTitle();
                }}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {savingTitle ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function SectionLabel({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-6 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Grid({
  videos,
  onSelect,
  canManage,
  onEditVideo,
  onDeleteVideo,
}: {
  videos: ReturnType<typeof useAppStore.getState>['videos'];
  onSelect: (index: number) => void;
  canManage: boolean;
  onEditVideo: (videoId: string, caption: string) => void;
  onDeleteVideo: (videoId: string) => Promise<void>;
}) {
  if (videos.length === 0) {
    return <div className="mt-6 rounded-[2rem] border border-dashed border-border bg-white/5 p-10 text-center text-sm text-muted-foreground">No clips in this section yet.</div>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => (
        <article
          key={video.id}
          className="group overflow-hidden rounded-[2rem] border border-border bg-white/5 text-left transition hover:-translate-y-1 hover:bg-white/10"
        >
          <button
            type="button"
            onClick={() => onSelect(index)}
            className="relative block aspect-[9/12] w-full text-left"
          >
            <VideoCover src={video.src} poster={video.poster} caption={video.caption} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="line-clamp-2 text-sm font-medium">{video.caption}</p>
              <p className="mt-1 text-xs text-white/75">
                {video.likes.toLocaleString()} likes · {video.rating.toFixed(1)} avg rating
              </p>
            </div>
          </button>
          {canManage ? (
            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <button
                type="button"
                onClick={() => {
                  onEditVideo(video.id, video.caption);
                }}
                className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30"
              >
                Edit title
              </button>
              <button
                type="button"
                onClick={() => {
                  void onDeleteVideo(video.id);
                }}
                className="rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function VideoCover({ src, poster, caption }: { src: string; poster: string; caption: string }) {
  const [showPoster, setShowPoster] = useState(false);

  if (showPoster) {
    return (
      <img
        src={poster}
        alt={caption}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <video
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={(event) => {
        const el = event.currentTarget;
        const targetTime = Number.isFinite(el.duration) && el.duration > 0
          ? Math.min(1, el.duration / 3)
          : 0;
        if (targetTime > 0) {
          try {
            el.currentTime = targetTime;
          } catch {
            // keep initial frame if seeking is blocked
          }
        }
      }}
      onCanPlay={(event) => {
        event.currentTarget.pause();
      }}
      onError={() => setShowPoster(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}
