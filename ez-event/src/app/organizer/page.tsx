"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({ totalEvents: 0, totalParticipants: 0, activeEvents: 0 });

  useEffect(() => {
    // Simulate loading stats
    setStats({ totalEvents: 12, totalParticipants: 384, activeEvents: 3 });
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sự kiện</p>
                <p className="text-3xl font-extrabold tracking-tight text-gray-900">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">🎪</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người tham gia</p>
                <p className="text-3xl font-extrabold tracking-tight text-gray-900">{stats.totalParticipants}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-3xl font-extrabold tracking-tight text-gray-900">{stats.activeEvents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
        </div>

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

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Thao tác nhanh</h3>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/organizer/events/create" 
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium shadow-sm">
              <span className="mr-2">+</span>
              Tạo sự kiện
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
          </div>
        </div>
      </div>
    </div>
  );
}
