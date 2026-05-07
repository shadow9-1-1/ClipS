import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
};

export function StatCard({ title, children, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </h3>
        </div>
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-4 text-zinc-900 dark:text-zinc-50">{children}</div>
    </div>
  );
}
