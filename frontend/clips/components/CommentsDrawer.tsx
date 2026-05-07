"use client";

import { useMemo, useState } from "react";
import { Heart, MessageCircleMore, Send } from "lucide-react";
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
  const canPost = draft.trim().length > 0;

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
      <DrawerContent className="max-h-[90vh] overflow-hidden md:mx-auto md:max-w-3xl md:rounded-t-[2rem]">
        <DrawerHeader className="mb-3 border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="flex items-center gap-2 text-slate-50">
                <MessageCircleMore className="h-5 w-5 text-primary" />
                Comments
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-slate-300">
                {visibleComments.length.toLocaleString()} replies on this clip
              </DrawerDescription>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              Live thread
            </span>
          </div>
        </DrawerHeader>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1 no-scrollbar">
          {visibleComments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-slate-300">
              No comments yet. Be the first to start the conversation.
            </div>
          ) : (
            visibleComments.map((comment) => {
              const author = getUser(comment.userId);
              const liked = Boolean(localLikes[comment.id]);
              return (
                <div key={comment.id} className="group flex items-start gap-3 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 to-slate-900/70 p-4 transition hover:border-white/20 hover:bg-slate-900/95">
                  <img src={author.avatar} alt={author.displayName} className="h-11 w-11 rounded-2xl border border-white/10 object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-50">{author.displayName}</span>
                      <span className="text-xs text-slate-300">@{author.username}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-100">{comment.text}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                      <button
                        type="button"
                        onClick={() => setLocalLikes((current) => ({ ...current, [comment.id]: !current[comment.id] }))}
                        className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-white/10", liked && "text-red-400")}
                      >
                        <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                        {(comment.likes + (liked ? 1 : 0)).toLocaleString()}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 border-t border-white/15 pt-4">
          <div className="flex items-end gap-3 rounded-3xl border border-white/15 bg-slate-900/90 p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 300))}
              placeholder="Write a comment..."
              maxLength={300}
              className="min-h-20 flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!canPost}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Post
            </button>
          </div>
          <div className="mt-2 text-right text-xs text-slate-400">{draft.length}/300</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
