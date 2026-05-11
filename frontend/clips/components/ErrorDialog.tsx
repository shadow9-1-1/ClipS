"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  onOpenChange: (open: boolean) => void;
};

export function ErrorDialog({ open, title = "Action failed", message = "Something went wrong. Please try again.", onOpenChange }: ErrorDialogProps) {
  const isError = /failed|error|not found|denied|forbidden/i.test(`${title} ${message}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md",
          isError
            ? "border-red-500/45 bg-gradient-to-b from-red-950/40 to-zinc-950 shadow-[0_0_0_1px_rgba(239,68,68,0.25)]"
            : "border-amber-400/35 bg-gradient-to-b from-amber-950/30 to-zinc-950"
        )}
      >
        <DialogHeader className="items-start text-left">
          <div
            className={cn(
              "mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
              isError ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-200"
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className={cn(isError ? "text-red-100" : "text-amber-100")}>
            {title}
          </DialogTitle>
          <DialogDescription className={cn(isError ? "text-red-200/90" : "text-amber-200/90")}>
            {message}
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn(
            "mt-4 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition hover:scale-[1.01]",
            isError
              ? "bg-red-500/85 text-white hover:bg-red-500"
              : "bg-amber-500/85 text-zinc-950 hover:bg-amber-500"
          )}
        >
          Dismiss
        </button>
      </DialogContent>
    </Dialog>
  );
}
