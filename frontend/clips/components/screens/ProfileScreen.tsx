"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Edit3, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { currentUserId, getUserByUsername, getVideosByUser, users } from "@/data/mock";
import { useAppStore, useMyProfile } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoFeedDialog } from "@/components/VideoFeedDialog";
import { FollowListDialog } from "@/components/FollowListDialog";

type ProfileScreenProps = {
  username?: string;
};

export function ProfileScreen({ username }: ProfileScreenProps) {
  const router = useRouter();
  const currentProfile = useMyProfile();
  const normalizedUsername = username?.trim().replace(/^@/, "").toLowerCase();
  const ownProfile = !normalizedUsername || normalizedUsername === currentProfile.username.toLowerCase();
  const foundProfile = ownProfile ? currentProfile : getUserByUsername(normalizedUsername ?? "");
  const profile = foundProfile ?? currentProfile;
  const profileMissing = !ownProfile && !foundProfile;
  const likedMap = useAppStore((state) => state.liked);
  const savedMap = useAppStore((state) => state.saved);
  const followingMap = useAppStore((state) => state.following);
  const allVideos = useAppStore((state) => state.videos);
  const [tab, setTab] = useState("videos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);

  const profileVideos = useMemo(() => getVideosByUser(profile.id), [profile.id]);
  const likedVideos = useMemo(() => allVideos.filter((video) => likedMap[video.id]), [allVideos, likedMap]);
  const savedVideos = useMemo(() => allVideos.filter((video) => savedMap[video.id]), [allVideos, savedMap]);
  const videosLabel = `Videos (${profileVideos.length})`;
  const likedLabel = ownProfile ? `My likes (${likedVideos.length})` : `Liked (${likedVideos.length})`;
  const savedLabel = ownProfile ? `My saved (${savedVideos.length})` : `Saved (${savedVideos.length})`;

  const followers = useMemo(() => users.filter((user) => user.id !== profile.id).slice(0, 4), [profile.id]);
  const following = useMemo(() => {
    if (ownProfile) {
      return users.filter((user) => followingMap[user.id]);
    }
    return users.filter((user) => user.id !== profile.id && user.id !== currentUserId).slice(0, 4);
  }, [followingMap, ownProfile, profile.id]);

  const selectedList = tab === "videos" ? profileVideos : tab === "liked" ? likedVideos : savedVideos;

  if (profileMissing) {
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
                  <span className="font-semibold text-foreground">{profile.followers.toLocaleString()}</span> followers
                </button>
                <button type="button" onClick={() => setFollowDialogOpen(true)} className="rounded-full border border-border bg-white/5 px-4 py-2 transition hover:bg-white/10">
                  <span className="font-semibold text-foreground">{profile.following.toLocaleString()}</span> following
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
              <button
                type="button"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
              >
                <Users className="h-4 w-4" />
                Follow
              </button>
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

function Grid({ videos, onSelect }: { videos: ReturnType<typeof getVideosByUser>; onSelect: (index: number) => void }) {
  if (videos.length === 0) {
    return <div className="mt-6 rounded-[2rem] border border-dashed border-border bg-white/5 p-10 text-center text-sm text-muted-foreground">No clips in this section yet.</div>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => (
        <button
          key={video.id}
          type="button"
          onClick={() => onSelect(index)}
          className="group overflow-hidden rounded-[2rem] border border-border bg-white/5 text-left transition hover:-translate-y-1 hover:bg-white/10"
        >
          <div className="relative aspect-[9/12]">
            <img src={video.poster} alt={video.caption} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="line-clamp-2 text-sm font-medium">{video.caption}</p>
              <p className="mt-1 text-xs text-white/75">{video.likes.toLocaleString()} likes</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
