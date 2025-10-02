"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function Item({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-base" aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function AdminSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EZ</span>
          </div>
          {!collapsed && <span className="text-lg font-bold text-gray-800">Admin</span>}
        </Link>
        <button
          onClick={() => setCollapsed(v => !v)}
          aria-label="Toggle sidebar width"
          className="text-gray-500 hover:text-gray-700 px-2 hidden md:inline-block"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {!collapsed && <div className="text-xs uppercase text-gray-400 px-2 mb-1">Quản lý</div>}
      <nav className="space-y-1">
        <Item href="/admin" label="Tổng quan" icon="🏠" />
        <Item href="/admin/events" label="Sự kiện" icon="🎫" />
        <Item href="/admin/events/checkin" label="Check-in" icon="📷" />
        <Item href="/admin/reports" label="Báo cáo" icon="📊" />
      </nav>

      <div className="mt-auto border-t pt-4">
        {!collapsed && <div className="text-xs uppercase text-gray-400 px-2 mb-1">Tài khoản</div>}
        <Link href="/auth" className={`block ${collapsed ? 'px-2 text-center' : 'px-3'} py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm`} onClick={onClose}>
          {collapsed ? '↩' : 'Đăng xuất'}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:block bg-white border-r min-h-screen p-4 sticky top-0 transition-all ${collapsed ? 'w-16' : 'w-64'}`}>
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex justify-end">
              <button aria-label="Đóng" className="text-gray-600" onClick={onClose}>✕</button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
