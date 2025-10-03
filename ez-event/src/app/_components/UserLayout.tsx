"use client";
import { ReactNode, useState } from "react";
import { UserSidebar } from "./UserSidebar";
import Link from "next/link";

export default function UserLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button aria-label="Mở menu" onClick={() => setMobileOpen(true)} className="text-gray-700">☰</button>
          <Link href="/student" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">EZ</span>
            </div>
            <span className="font-extrabold tracking-tight text-gray-900">EZEvent</span>
          </Link>
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
