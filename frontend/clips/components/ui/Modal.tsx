"use client";

import { useCallback, useEffect, useId, type ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider dialog for forms */
  size?: "sm" | "md" | "lg";
  /** Close when clicking the backdrop */
  closeOnBackdrop?: boolean;
};

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  const titleId = useId();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200 motion-reduce:transition-none"
        onClick={() => (closeOnBackdrop ? onClose() : undefined)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative z-[101] w-full ${sizeClass[size]} origin-bottom scale-100 transform rounded-xl border border-zinc-200 bg-white shadow-xl transition-all duration-200 ease-out motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-950 sm:origin-center`}
      >
        {title ? (
          <div
            id={titleId}
            className="border-b border-zinc-100 px-4 py-3 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
          >
            {title}
          </div>
        ) : null}
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
