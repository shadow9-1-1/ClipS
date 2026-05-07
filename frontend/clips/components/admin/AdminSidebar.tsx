"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/moderation", label: "Moderation" },
];

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col gap-4 border-r border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 md:flex">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-600 font-bold">A</div>
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Admin</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Control panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  active ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-50" : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300"
                }`}
              >
                <span className="w-2" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto text-xs text-zinc-500 dark:text-zinc-400">Signed in as admin</div>
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 bg-black/30 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />

        <aside className={`relative z-50 h-full w-72 transform bg-white px-4 py-6 dark:bg-zinc-900/90 transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-600 font-bold">A</div>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Admin</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Control panel</div>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-zinc-600 dark:text-zinc-300">
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    active ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-50" : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300"
                  }`}
                >
                  <span className="w-2" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto text-xs text-zinc-500 dark:text-zinc-400">Signed in as admin</div>
        </aside>
      </div>
    </>
  );
}
