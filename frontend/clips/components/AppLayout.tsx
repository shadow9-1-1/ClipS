"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ErrorDialog } from "@/components/ErrorDialog";
import { Sidebar } from "@/components/Sidebar";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);

  const feedMode = pathname === "/";

  return (
    <div className="min-h-screen">
      <Sidebar />
      <BottomNav />
      <main
        className={cn(
          "min-h-screen md:pl-80",
          feedMode ? "px-0 py-0 md:pr-6" : "px-3 py-3 md:pr-6 md:py-6"
        )}
      >
        <div className={cn("mx-auto w-full", feedMode ? "max-w-none" : "max-w-6xl")}>{children}</div>
      </main>
      <ErrorDialog
        open={Boolean(error)}
        title={error?.title}
        message={error?.message}
        onOpenChange={(open) => {
          if (!open) setError(null);
        }}
      />
    </div>
  );
}
