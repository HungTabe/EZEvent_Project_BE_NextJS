"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface EventReport {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  totalRegistrations: number;
  totalCheckins: number;
  attendanceRate: number;
  status: string;
}

interface OverallStats {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckins: number;
  overallAttendanceRate: number;
  pendingEvents: number;
  approvedEvents: number;
}

export default function ReportsPage() {
  const [events, setEvents] = useState<EventReport[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        // Fetch events list (admin)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const eventsRes = await fetch("/api/admin/events/list", { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
        const eventsData = await eventsRes.json();
        
        // Fetch reports for each event
        const eventsWithReports = await Promise.all(
          (eventsData.events || []).map(async (event: any) => {
            try {
              const reportRes = await fetch(`/api/admin/events/report?eventId=${event.id}`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
              const reportData = await reportRes.json();
              
              return {
                id: event.id,
                name: event.name,
                startTime: event.startTime,
                endTime: event.endTime,
                totalRegistrations: reportData.totalRegistrations || 0,
                totalCheckins: reportData.totalCheckins || 0,
                attendanceRate: reportData.attendanceRate || 0,
                status: event.status
              };
            } catch (error) {
              return {
                id: event.id,
                name: event.name,
                startTime: event.startTime,
                endTime: event.endTime,
                totalRegistrations: 0,
                totalCheckins: 0,
                attendanceRate: 0,
                status: event.status
              };
            }
          })
        );

        setEvents(eventsWithReports);

        // Calculate overall stats
        const overallStats: OverallStats = {
          totalEvents: eventsWithReports.length,
          totalRegistrations: eventsWithReports.reduce((sum, event) => sum + event.totalRegistrations, 0),
          totalCheckins: eventsWithReports.reduce((sum, event) => sum + event.totalCheckins, 0),
          overallAttendanceRate: 0,
          pendingEvents: eventsWithReports.filter(e => e.status === 'PENDING').length,
          approvedEvents: eventsWithReports.filter(e => e.status === 'APPROVED').length
        };

        if (overallStats.totalRegistrations > 0) {
          overallStats.overallAttendanceRate = (overallStats.totalCheckins / overallStats.totalRegistrations) * 100;
        }

        setStats(overallStats);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Đã từ chối';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p>Đang tải báo cáo...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-2 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-orange-700">Báo cáo & Thống kê</h1>
          <p className="text-gray-600 text-sm">Tổng quan về tình hình sự kiện, đăng ký và tham gia.</p>
        </div>

        {/* Overall Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-blue-100 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-blue-800">{stats.totalEvents}</div>
              <div className="text-sm text-blue-600">Tổng sự kiện</div>
            </div>
            <div className="bg-green-100 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-800">{stats.approvedEvents}</div>
              <div className="text-sm text-green-600">Đã duyệt</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-yellow-800">{stats.pendingEvents}</div>
              <div className="text-sm text-yellow-600">Chờ duyệt</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-purple-800">{stats.totalRegistrations}</div>
              <div className="text-sm text-purple-600">Tổng đăng ký</div>
            </div>
            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-orange-800">{stats.totalCheckins}</div>
              <div className="text-sm text-orange-600">Tổng tham gia</div>
            </div>
          </div>
        )}

        {/* Attendance Rate */}
        {stats && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-green-700">Tỷ lệ tham gia tổng thể</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-8">
                <div 
                  className="bg-green-600 h-8 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ width: `${Math.min(stats.overallAttendanceRate, 100)}%` }}
                >
                  {stats.overallAttendanceRate.toFixed(1)}%
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {stats.totalCheckins}/{stats.totalRegistrations} người tham gia
              </div>
            </div>
          </div>
        )}

        {/* Events Report Table */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-700">Báo cáo chi tiết sự kiện</h2>
            <Link 
              href="/admin/events" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Quản lý sự kiện
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <div>Chưa có sự kiện nào</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tên sự kiện</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Thời gian</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Đăng ký</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Tham gia</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Tỷ lệ</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{event.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div>{new Date(event.startTime).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs">{new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-medium text-blue-600">{event.totalRegistrations}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-medium text-green-600">{event.totalCheckins}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`font-medium ${getAttendanceColor(event.attendanceRate)}`}>
                          {event.attendanceRate.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Xem
                          </Link>
                          {event.status === 'APPROVED' && (
                            <Link
                              href={`/admin/events/${event.id}/qr`}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              QR
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-gray-100 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Xuất báo cáo</h3>
          <div className="flex space-x-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              📊 Xuất Excel
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              📄 Xuất PDF
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              📧 Gửi email
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}



