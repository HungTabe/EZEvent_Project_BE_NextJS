"use client";
import { ReactNode, useState } from "react";
import { UserSidebar } from "./UserSidebar";
import Link from "next/link";

export default function UserLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button aria-label="Mở menu" onClick={() => setMobileOpen(true)} className="text-gray-700">☰</button>
          <Link href="/events" className="font-semibold text-gray-800">EZ Event</Link>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <UserSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
