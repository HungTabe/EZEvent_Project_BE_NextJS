"use client";
import { ReactNode, useState } from "react";
import { AdminSidebar } from "./_components/Sidebar";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button aria-label="Mở menu" onClick={() => setMobileOpen(true)} className="text-gray-700">☰</button>
          <Link href="/admin" className="font-semibold text-gray-800">EZ Admin</Link>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Content */}
        <main className="flex-1 p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
