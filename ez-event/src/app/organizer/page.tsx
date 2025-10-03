"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Stats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  totalParticipants: number;
  checkedInParticipants: number;
  completedEvents: number;
}

interface RecentEvent {
  id: number;
  name: string;
  startTime: string;
  participantCount: number;
}

interface PopularEvent {
  id: number;
  name: string;
  participantCount: number;
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    checkedInParticipants: 0,
    completedEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [popularEvent, setPopularEvent] = useState<PopularEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/auth';
          return;
        }

        const res = await fetch('/api/organizer/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        
        if (res.ok) {
          setStats(data.stats);
          setRecentEvents(data.recentEvents || []);
          setPopularEvent(data.popularEvent);
        } else {
          setError(data.error || 'Không thể tải thống kê');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-20 -z-10 overflow-hidden">
        <div className="mx-auto max-w-7xl blur-3xl opacity-30">
          <div className="h-64 sm:h-80 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-full" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Dashboard Ban tổ chức
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl leading-relaxed">
              Chào mừng bạn trở lại! Quản lý sự kiện một cách chuyên nghiệp và hiệu quả.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/organizer/events/create" 
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <span className="mr-2">✨</span>
                Tạo sự kiện mới
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-32 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="px-6 pb-6">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-gray-100 mb-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thống kê...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Không thể tải thống kê</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Approval Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800 text-lg mb-2">🎉 Phê duyệt tự động</h3>
              <p className="text-green-700 mb-3">
                Là <strong>Organizer</strong>, sự kiện của bạn sẽ được <strong>phê duyệt tự động</strong> ngay khi tạo. 
                Không cần chờ admin duyệt!
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">🚀 Tạo ngay có QR</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">🔗 Link chia sẻ sẵn sàng</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">👥 Sinh viên có thể đăng ký</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎪</span>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm font-medium">Tổng sự kiện</p>
                  <p className="text-3xl font-bold">{stats.totalEvents}</p>
                </div>
              </div>
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Đang hoạt động: {stats.activeEvents}</span>
                <span>Đã hoàn thành: {stats.completedEvents}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm font-medium">Tổng tham gia</p>
                  <p className="text-3xl font-bold">{stats.totalParticipants}</p>
                </div>
              </div>
              <div className="flex justify-between text-green-100 text-sm">
                <span>Đã check-in: {stats.checkedInParticipants}</span>
                <span>Tỷ lệ: {stats.totalParticipants > 0 ? Math.round((stats.checkedInParticipants / stats.totalParticipants) * 100) : 0}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="text-right">
                  <p className="text-purple-100 text-sm font-medium">Sắp diễn ra</p>
                  <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
                </div>
              </div>
              <div className="text-purple-100 text-sm">
                Trong 7 ngày tới
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-right">
                  <p className="text-orange-100 text-sm font-medium">Phổ biến nhất</p>
                  <p className="text-xl font-bold">{popularEvent?.participantCount || 0}</p>
                </div>
              </div>
              <div className="text-orange-100 text-sm truncate">
                {popularEvent?.name || 'Chưa có sự kiện'}
              </div>
            </div>
          </div>
        )}

        {/* Recent Events */}
        {!loading && !error && recentEvents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sự kiện gần đây</h2>
              <Link href="/organizer/events" className="text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎫</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.startTime).toLocaleDateString('vi-VN')} • {event.participantCount} người tham gia
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/organizer/events/${event.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Quản lý
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          <Link href="/organizer/events" 
            className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-3xl">🎫</span>
              </div>
              <div className="w-6 h-6 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Quản lý sự kiện</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Tạo, chỉnh sửa và theo dõi tất cả sự kiện của bạn. Quản lý thông tin chi tiết và cập nhật trạng thái.
            </p>
            <div className="mt-4 flex items-center text-sm font-medium">
              <span>Xem chi tiết</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/organizer/events/checkin" 
            className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-3xl">📱</span>
              </div>
              <div className="w-6 h-6 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Check-in QR</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Quét mã QR để check-in người tham gia nhanh chóng. Theo dõi thời gian thực và quản lý danh sách.
            </p>
            <div className="mt-4 flex items-center text-sm font-medium">
              <span>Bắt đầu check-in</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/organizer/reports" 
            className="group bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-3xl">📊</span>
              </div>
              <div className="w-6 h-6 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Báo cáo & Thống kê</h3>
            <p className="text-purple-100 text-sm leading-relaxed">
              Xem báo cáo chi tiết, thống kê tham gia và phân tích hiệu quả của các sự kiện.
            </p>
            <div className="mt-4 flex items-center text-sm font-medium">
              <span>Xem báo cáo</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>

        {/* Performance Metrics */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Engagement Rate */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ tham gia</h3>
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in Rate</span>
                  <span className="font-semibold text-indigo-600">
                    {stats.totalParticipants > 0 ? Math.round((stats.checkedInParticipants / stats.totalParticipants) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalParticipants > 0 ? (stats.checkedInParticipants / stats.totalParticipants) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {stats.checkedInParticipants} / {stats.totalParticipants} người đã tham gia thực tế
                </p>
              </div>
            </div>

            {/* Event Status Distribution */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trạng thái sự kiện</h3>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span className="text-lg">🗠️</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Đang hoạt động</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats.activeEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Sắp diễn ra</span>
                  </div>
                  <span className="font-semibold text-blue-600">{stats.upcomingEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Đã hoàn thành</span>
                  </div>
                  <span className="font-semibold text-gray-600">{stats.completedEvents}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Thao tác nhanh</h3>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/organizer/events/create" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <span className="mr-2">+</span>
              Tạo sự kiện mới
            </Link>
            <Link href="/organizer/events" 
              className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors text-sm font-medium shadow-sm">
              <span className="mr-2">📋</span>
              Danh sách sự kiện
            </Link>
            <Link href="/organizer/reports" 
              className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors text-sm font-medium shadow-sm">
              <span className="mr-2">📈</span>
              Xem thống kê
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium shadow-sm"
            >
              <span className="mr-2">🔄</span>
              Làm mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
