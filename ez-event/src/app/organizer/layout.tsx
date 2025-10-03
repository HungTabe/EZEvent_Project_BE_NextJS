"use client";
import { ReactNode, useState } from "react";
import { AdminSidebar } from "./_components/Sidebar";
import Link from "next/link";

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button 
            aria-label="Mở menu" 
            onClick={() => setMobileOpen(true)} 
            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <span className="text-xl">☰</span>
          </button>
          
          <Link href="/organizer" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EZ</span>
            </div>
            <span className="font-bold text-emerald-800">Organizer</span>
          </Link>
          
          {/* Profile or actions */}
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-x-auto">
          <div className="w-full min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
