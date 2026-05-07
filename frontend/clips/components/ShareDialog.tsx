"use client";

import { useMemo } from "react";
import { Copy, Facebook, MessageCircle, Mail, Send, Share2, Smartphone, MessageSquareMore } from "lucide-react";
import type { Video } from "@/data/mock";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video;
};

export function ShareDialog({ open, onOpenChange, video }: ShareDialogProps) {
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/${video.id}`;
    return `${window.location.origin}/?video=${video.id}`;
  }, [video.id]);

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  const shareTargets = [
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(shareUrl)}` },
    { label: "X", icon: Share2, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "Telegram", icon: Send, href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}` },
    { label: "Messenger", icon: MessageSquareMore, href: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${encodeURIComponent("ClipS video")}&body=${encodeURIComponent(shareUrl)}` },
  ];

  const nativeShare = async () => {
    if (!navigator.share) return copy();
    await navigator.share({ title: "ClipS", text: video.caption, url: shareUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share clip</DialogTitle>
          <DialogDescription>Copy the link or send it to a specific app.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={copy} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/10 px-5 text-sm font-semibold text-foreground transition hover:scale-[1.01] hover:bg-white/15">
            <Copy className="h-4 w-4" /> Copy link
          </button>
          <button type="button" onClick={nativeShare} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/5 px-5 text-sm font-semibold text-foreground transition hover:bg-white/10">
            <Smartphone className="h-4 w-4" /> Native share
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shareTargets.map((target) => {
            const Icon = target.icon;
            return (
              <a
                key={target.label}
                href={target.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-3xl border border-border bg-white/5 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{target.label}</span>
              </a>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
