"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex">
          <AdminSidebar isOpen={open} onClose={() => setOpen(false)} />

          <main className="min-h-screen w-full p-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-4 flex items-center justify-between md:hidden">
                <button
                  aria-label="Open admin menu"
                  title="Open admin menu"
                  onClick={() => setOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 hover:from-sky-500 hover:to-sky-400 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <span className={`inline-block transform transition-transform duration-200 ${open ? "-rotate-90" : "rotate-0"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </span>
                  <span className="hidden sm:inline">Menu</span>
                </button>
              </div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
