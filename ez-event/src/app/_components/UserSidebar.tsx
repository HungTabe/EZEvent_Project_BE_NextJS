"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name?: string;
  email: string;
}

function NavItem({ href, label, icon, badge }: { href: string; label: string; icon: string; badge?: number }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-1 text-xs rounded-full ${active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export function UserSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as { id: number; name?: string; email: string };
        setUser({
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email
        });

        // Fetch registration count for badge
        fetch(`/api/user/registrations?userId=${parsedUser.id}`)
          .then(res => res.json())
          .then(data => {
            setRegistrationCount(data.registrations?.length || 0);
          })
          .catch(() => {});
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const SidebarContent = (
    <div className="h-full flex flex-col">
      {/* User Profile */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {(user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name || user?.email}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="text-xs uppercase text-gray-400 px-2 mb-2">Hoạt động</div>
      <nav className="space-y-1 flex-1">
        <NavItem href="/events" label="Khám phá sự kiện" icon="🎫" />
        <NavItem href="/user" label="Trang cá nhân" icon="👤" badge={registrationCount} />
      </nav>

      {/* Quick Actions */}
      <div className="mt-4 border-t pt-4">
        <div className="text-xs uppercase text-gray-400 px-2 mb-2">Tài khoản</div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🚪</span>
            <span>Đăng xuất</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r min-h-screen p-4 sticky top-0">
        <div className="mb-6">
          <Link href="/events" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EZ</span>
            </div>
            <span className="text-lg font-bold text-gray-800">EZ Event</span>
          </Link>
        </div>
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/events" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EZ</span>
                </div>
                <span className="text-lg font-bold text-gray-800">EZ Event</span>
              </Link>
              <button aria-label="Đóng" className="text-gray-600" onClick={onClose}>✕</button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
