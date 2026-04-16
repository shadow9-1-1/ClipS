"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/videos", label: "Videos" },
  { href: "/upload", label: "Upload" },
  { href: "/settings", label: "Settings" },
] as const;

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const links = [
    ...navLinks,
    ...(user?.role === "admin"
      ? ([{ href: "/admin", label: "Admin" }] as const)
      : []),
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            ClipSphere
          </Link>
          {!loading ? (
            <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
              {user ? `Hi, ${user.username}` : "Not signed in"}
            </span>
          ) : (
            <span className="hidden text-xs text-zinc-400 sm:inline">…</span>
          )}
        </div>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}
          {!loading && !user ? (
            <Link
              href="/login"
              className="ml-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Sign in
            </Link>
          ) : null}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 md:hidden dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          {open ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                onNavigate={() => setOpen(false)}
              />
            ))}
            {!loading && !user ? (
              <Link
                href="/login"
                className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 text-center text-sm font-medium text-zinc-900 dark:border-zinc-600 dark:text-zinc-100"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
