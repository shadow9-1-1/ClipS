"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonHTMLAttributes } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  onOpenChange: (open: boolean) => void;
};

export function ErrorDialog({ open, title = "Action failed", message = "Something went wrong. Please try again.", onOpenChange }: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-rose-500/30 bg-card">
        <DialogHeader className="items-start text-left">
          <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn("mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]")}
        >
          Dismiss
        </button>
      </DialogContent>
    </Dialog>
  );
}
