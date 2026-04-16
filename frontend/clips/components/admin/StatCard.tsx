import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  children: ReactNode;
};

export function StatCard({ title, children }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <div className="mt-3 text-zinc-900 dark:text-zinc-50">{children}</div>
    </div>
  );
}
