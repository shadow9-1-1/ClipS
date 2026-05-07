"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const active = value >= starValue;
        return (
          <button
            key={starValue}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange?.(starValue);
            }}
            className={cn(
              "rounded-full transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
              onChange ? "cursor-pointer" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                active
                  ? "fill-amber-300 text-amber-300 drop-shadow-[0_0_6px_rgba(252,187,0,0.55)]"
                  : "fill-transparent text-slate-500"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
