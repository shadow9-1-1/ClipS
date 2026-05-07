"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  compact?: boolean;
};

export function NavLink({ href, label, icon: Icon, compact }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-white/5 text-white shadow-lg shadow-white/10 hover:bg-white/25"
          : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5 transition group-hover:scale-110", active && "text-white")} />
      {!compact ? <span>{label}</span> : null}
    </Link>
  );
}
