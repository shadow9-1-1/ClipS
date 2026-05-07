"use client";

import { useMemo } from "react";
import type { User } from "@/data/mock";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";

type FollowListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followers: User[];
  following: User[];
  title: string;
};

export function FollowListDialog({ open, onOpenChange, followers, following, title }: FollowListDialogProps) {
  const activeFollowing = useAppStore((state) => state.following);
  const toggleFollow = useAppStore((state) => state.toggleFollow);

  const followerList = useMemo(() => followers, [followers]);
  const followingList = useMemo(() => following, [following]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Keep track of the creators you follow and the people following you.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="followers" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="mt-4 space-y-3">
            {followerList.map((user) => (
              <Row key={user.id} user={user} isFollowing={Boolean(activeFollowing[user.id])} onToggleFollow={toggleFollow} />
            ))}
          </TabsContent>
          <TabsContent value="following" className="mt-4 space-y-3">
            {followingList.map((user) => (
              <Row key={user.id} user={user} isFollowing={Boolean(activeFollowing[user.id])} onToggleFollow={toggleFollow} />
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Row({ user, isFollowing, onToggleFollow }: { user: User; isFollowing: boolean; onToggleFollow: (userId: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border bg-white/5 p-4">
      <img src={user.avatar} alt={user.displayName} className="h-12 w-12 rounded-2xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{user.displayName}</p>
          {user.verified ? <span className="text-xs text-primary">Verified</span> : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggleFollow(user.id)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isFollowing ? "bg-white/10 text-foreground" : "bg-primary text-primary-foreground"}`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
