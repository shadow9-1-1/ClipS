"use client";

import { useMemo, useState } from "react";
import { Heart, Send } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useAppStore } from "@/lib/store";
import { getUser } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CommentsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
};

export function CommentsDrawer({ open, onOpenChange, videoId }: CommentsDrawerProps) {
  const allComments = useAppStore((state) => state.comments);
  const comments = useMemo(() => allComments.filter((comment) => comment.videoId === videoId), [allComments, videoId]);
  const addComment = useAppStore((state) => state.addComment);
  const setError = useAppStore((state) => state.setError);
  const [draft, setDraft] = useState("");
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});

  const visibleComments = useMemo(() => comments, [comments]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    if (Math.random() < 0.12) {
      setError({ title: "Could not add comment", message: "A simulated network hiccup blocked this reply. Please try again." });
      return;
    }

    addComment(videoId, text);
    setDraft("");
    toast.success("Comment posted");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-hidden md:max-w-2xl md:mx-auto md:rounded-t-[2rem]">
        <DrawerHeader className="mb-4">
          <DrawerTitle>Comments</DrawerTitle>
          <DrawerDescription>{visibleComments.length.toLocaleString()} replies on this clip</DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1 no-scrollbar">
          {visibleComments.map((comment) => {
            const author = getUser(comment.userId);
            const liked = Boolean(localLikes[comment.id]);
            return (
              <div key={comment.id} className="flex items-start gap-3 rounded-3xl border border-border bg-white/5 p-4">
                <img src={author.avatar} alt={author.displayName} className="h-10 w-10 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-foreground">{author.displayName}</span>
                    <span className="text-xs text-muted-foreground">@{author.username}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setLocalLikes((current) => ({ ...current, [comment.id]: !current[comment.id] }))}
                      className={cn("inline-flex items-center gap-1 transition hover:text-primary", liked && "text-primary")}
                    >
                      <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                      {(comment.likes + (liked ? 1 : 0)).toLocaleString()}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-end gap-3 border-t border-border pt-4">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a comment..."
            maxLength={300}
            className="min-h-24 flex-1 rounded-3xl border border-border bg-background/80 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
          >
            <Send className="h-4 w-4" />
            Post
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
