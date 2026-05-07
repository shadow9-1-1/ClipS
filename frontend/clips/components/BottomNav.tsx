"use client";

import { Compass, Home, Settings, SquareArrowUpRight, UserRound } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export function BottomNav() {
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[1.5rem] border border-border/70 p-2 md:hidden">
      <NavLink href="/" label="Home" icon={Home} compact />
      <NavLink href="/explore" label="Explore" icon={Compass} compact />
      <NavLink href="/upload" label="Upload" icon={SquareArrowUpRight} compact />
      <NavLink href="/profile" label="Profile" icon={UserRound} compact />
      <NavLink href="/settings" label="Settings" icon={Settings} compact />
    </nav>
  );
}
