"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Video } from "@/data/mock";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const reasons = ["Spam", "Harassment", "Violence", "Nudity", "Copyright", "Misinformation", "Other"] as const;

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video;
};

export function ReportDialog({ open, onOpenChange, video }: ReportDialogProps) {
  const reportVideo = useAppStore((state) => state.reportVideo);
  const setError = useAppStore((state) => state.setError);
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<(typeof reasons)[number] | "">("");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setStep(0);
    setReason("");
    setDetails("");
    setDone(false);
  };

  const submit = () => {
    if (!reason) return;
    if (Math.random() < 0.1) {
      setError({ title: "Report failed", message: "A simulated network error prevented this report from being sent." });
      return;
    }

    reportVideo(video.id, reason, details.trim() || undefined);
    setDone(true);
    toast.success("Report submitted");
    setTimeout(() => {
      onOpenChange(false);
      reset();
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report clip</DialogTitle>
          <DialogDescription>Choose a reason and optionally add more context.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-14 w-14 text-primary" />
            <div>
              <p className="text-lg font-semibold">Thanks for the report</p>
              <p className="text-sm text-muted-foreground">We logged the issue for {video.caption.slice(0, 30)}...</p>
            </div>
          </div>
        ) : step === 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {reasons.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setReason(item);
                  setStep(1);
                }}
                className={`rounded-3xl border px-4 py-4 text-left text-sm transition ${reason === item ? "border-primary bg-primary/15 text-primary" : "border-border bg-white/5 hover:bg-white/10"}`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl border border-border bg-white/5 p-4">
              <p className="text-sm font-medium text-foreground">Selected reason</p>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value.slice(0, 300))}
              rows={5}
              placeholder="Add extra context (optional)"
              className="w-full rounded-3xl border border-border bg-background/80 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <button type="button" onClick={() => setStep(0)} className="font-medium text-foreground transition hover:text-primary">
                Change reason
              </button>
              <span>{details.length}/300</span>
            </div>
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
            >
              Submit report
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
