"use client";

import { Compass, Home, LogOut, Settings, SquareArrowUpRight, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { NavLink } from "@/components/NavLink";
import { AuthService } from "@/lib/auth-service";

export function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    AuthService.clearToken();
    router.push("/auth/login");
  };

  return (
    <aside className="glass fixed left-0 top-0 z-40 hidden h-dvh w-72 flex-col border-r border-border/70 px-5 py-6 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-sm font-black text-primary-foreground shadow-soft">
          C
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">ClipS</p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">short video social</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        <NavLink href="/" label="Home" icon={Home} />
        <NavLink href="/explore" label="Explore" icon={Compass} />
        <NavLink href="/upload" label="Upload" icon={SquareArrowUpRight} />
        <NavLink href="/profile" label="Profile" icon={UserRound} />
        <NavLink href="/settings" label="Settings" icon={Settings} />
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-white/5 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}
