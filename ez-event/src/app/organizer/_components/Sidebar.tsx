"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function Item({ href, label, icon, collapsed = false }: { href: string; label: string; icon: string; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  
  if (collapsed) {
    return (
      <Link
        href={href}
        className={`group relative flex items-center justify-center w-12 h-12 mx-auto rounded-xl text-sm font-medium transition-all duration-200 ${
          active 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
        }`}
        title={label}
      >
        <span className="text-xl" aria-hidden>{icon}</span>
        
        {/* Tooltip for collapsed state */}
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
          {label}
          {/* Arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </Link>
    );
  }
  
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
      }`}
    >
      <span className="text-lg flex-shrink-0" aria-hidden>{icon}</span>
      <span className="transition-all duration-200">{label}</span>
    </Link>
  );
}

export function AdminSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className={`mb-8 ${collapsed && !isMobile ? 'flex flex-col items-center gap-4' : 'flex items-center justify-between'}`}>
        <Link href="/organizer" className={`flex items-center transition-all duration-200 ${collapsed && !isMobile ? 'flex-col gap-1' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-lg">EZ</span>
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-extrabold tracking-tight text-gray-900 text-xl">
              Organizer
            </span>
          )}
        </Link>
        
        {!isMobile && (
          <button
            onClick={() => setCollapsed(v => !v)}
            aria-label="Toggle sidebar width"
            className={`p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex-shrink-0 ${
              collapsed ? 'w-10 h-10' : ''
            }`}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            <span className={`text-lg transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}>
              ⟵
            </span>
          </button>
        )}
      </div>

      {/* Section Label */}
      {(!collapsed || isMobile) && (
        <div className="text-xs uppercase font-semibold text-gray-500 px-3 mb-3">
          Ban tổ chức
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed && !isMobile ? 'space-y-3' : 'space-y-2'}`}>
        <Item href="/organizer" label="Tổng quan" icon="🏠" collapsed={collapsed && !isMobile} />
        <Item href="/organizer/events" label="Sự kiện của tôi" icon="🎫" collapsed={collapsed && !isMobile} />
        <Item href="/organizer/events/checkin" label="Check-in QR" icon="📷" collapsed={collapsed && !isMobile} />
        <Item href="/organizer/reports" label="Báo cáo" icon="📊" collapsed={collapsed && !isMobile} />
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        {(!collapsed || isMobile) && (
          <div className="text-xs uppercase font-semibold text-gray-500 px-3 mb-3">
            Tài khoản
          </div>
        )}
        
        {collapsed && !isMobile ? (
          <Link 
            href="/auth" 
            className="group relative flex items-center justify-center w-12 h-12 mx-auto text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-medium transition-all duration-200"
            onClick={onClose}
            title="Đăng xuất"
          >
            <span className="text-xl">🚪</span>
            
            {/* Tooltip for collapsed state */}
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Đăng xuất
              {/* Arrow */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </Link>
        ) : (
          <Link 
            href="/auth" 
            className="group flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-medium transition-all duration-200"
            onClick={onClose}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            <span>Đăng xuất</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex bg-white border-r border-gray-200 min-h-screen sticky top-0 transition-all duration-300 shadow-sm ${
        collapsed ? 'w-24' : 'w-72'
      }`}>
        <div className="w-full p-4">
          <SidebarContent isMobile={false} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          
          {/* Mobile sidebar */}
          <aside className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform">
            <div className="p-4 h-full">
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <button 
                  aria-label="Đóng menu" 
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <SidebarContent isMobile={true} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
