"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Event {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  qrCode?: string;
  shareUrl?: string;
  _count?: { registrations: number };
}

interface RegistrationUser {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
}

interface Registration {
  id: number;
  userId: number;
  eventId: number;
  checkedIn: boolean;
  createdAt: string;
  user?: RegistrationUser;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  type StatusFilter = 'ALL' | Event['status'];
  type SortOption = 'NEWEST' | 'OLDEST' | 'A_TO_Z' | 'Z_TO_A';
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [openEventId, setOpenEventId] = useState<number | null>(null);
  const [registrationsByEvent, setRegistrationsByEvent] = useState<Record<number, Registration[]>>({});
  const [registrationsLoading, setRegistrationsLoading] = useState<Record<number, boolean>>({});

  const now = new Date();
  const summary = {
    total: events.length,
    pending: events.filter(e => e.status === 'PENDING').length,
    approved: events.filter(e => e.status === 'APPROVED').length,
    rejected: events.filter(e => e.status === 'REJECTED').length,
    upcoming: events.filter(e => new Date(e.startTime) >= now).length,
  };

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch("/api/admin/events/list", {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      setEvents(data.events || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const handleApproveEvent = async (eventId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch("/api/admin/events/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ eventId, status }),
      });

      if (res.ok) {
        // Refresh events list
        const res = await fetch("/api/admin/events/list", { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

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

  async function loadRegistrations(eventId: number) {
    setRegistrationsLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch(`/api/admin/events/registrations?eventId=${eventId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      const data = await res.json();
      setRegistrationsByEvent(prev => ({ ...prev, [eventId]: data.registrations || [] }));
    } catch (e) {
      console.error('Failed to load registrations', e);
      setRegistrationsByEvent(prev => ({ ...prev, [eventId]: [] }));
    } finally {
      setRegistrationsLoading(prev => ({ ...prev, [eventId]: false }));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 sm:p-6 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Quản lý sự kiện</h1>
            <p className="text-gray-600 text-sm">Tạo, duyệt và chia sẻ sự kiện</p>
          </div>
          <Link
            href="/admin/events/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors shadow-sm"
            aria-label="Tạo sự kiện mới"
          >
            + Tạo sự kiện
          </Link>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
              <div className="text-xs text-gray-600">Tổng sự kiện</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
              <div className="text-xs text-gray-600">Chờ duyệt</div>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
              <div className="text-xs text-gray-600">Đã duyệt</div>
              <div className="text-2xl font-bold text-green-600">{summary.approved}</div>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
              <div className="text-xs text-gray-600">Đã từ chối</div>
              <div className="text-2xl font-bold text-red-600">{summary.rejected}</div>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
              <div className="text-xs text-gray-600">Sắp diễn ra</div>
              <div className="text-2xl font-bold text-purple-600">{summary.upcoming}</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Tìm kiếm sự kiện</label>
              <input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, mô tả, địa điểm..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="sr-only" htmlFor="statusFilter">Lọc trạng thái</label>
              <select
                id="statusFilter"
                value={status}
                onChange={(e)=>setStatus(e.target.value as StatusFilter)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Đã từ chối</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
              <label className="sr-only" htmlFor="sortBy">Sắp xếp</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e)=>setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              >
                <option value="NEWEST">Mới nhất</option>
                <option value="OLDEST">Cũ nhất</option>
                <option value="A_TO_Z">A → Z</option>
                <option value="Z_TO_A">Z → A</option>
              </select>
            </div>
          </div>
        </section>

        {/* List */}
        <div>
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 text-gray-500">Đang tải danh sách sự kiện...</div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 text-gray-600 text-center">
              <p className="mb-2">Chưa có sự kiện nào.</p>
              <Link href="/admin/events/create" className="text-blue-700 hover:underline">Tạo sự kiện đầu tiên</Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events
                .filter(e => status === 'ALL' ? true : e.status === status)
                .filter(e => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    e.name.toLowerCase().includes(q) ||
                    (e.description || '').toLowerCase().includes(q) ||
                    (e.location || '').toLowerCase().includes(q)
                  );
                })
                .sort((a, b) => {
                  if (sortBy === 'NEWEST') return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
                  if (sortBy === 'OLDEST') return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                  if (sortBy === 'A_TO_Z') return a.name.localeCompare(b.name);
                  if (sortBy === 'Z_TO_A') return b.name.localeCompare(a.name);
                  return 0;
                })
                .map(event => (
                <li key={event.id} className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <Link href={`/admin/events/${event.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-700">
                      {event.name}
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800" title="Số người đăng ký">
                        👥 {event._count?.registrations ?? 0}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mt-1 line-clamp-2 min-h-[40px]">{event.description}</div>
                  <div className="text-xs text-gray-600 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {event.location && <span className="">📍 {event.location}</span>}
                    {event.startTime && <span className="">🕒 {new Date(event.startTime).toLocaleString()}</span>}
                    {event.endTime && <span className="">⏳ {new Date(event.endTime).toLocaleString()}</span>}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-3">
                    {event.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveEvent(event.id, 'APPROVED')}
                          className="inline-flex items-center bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
                          aria-label="Duyệt sự kiện"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleApproveEvent(event.id, 'REJECTED')}
                          className="inline-flex items-center bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
                          aria-label="Từ chối sự kiện"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {event.status === 'APPROVED' && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => navigator.clipboard.writeText(event.shareUrl || '')}
                          className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
                          aria-label="Sao chép liên kết chia sẻ"
                        >
                          Copy Link
                        </button>
                        <Link
                          href={`/admin/events/${event.id}/qr`}
                          className="inline-flex items-center bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
                          aria-label="Xem QR của sự kiện"
                        >
                          Xem QR
                        </Link>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const nextOpen = openEventId === event.id ? null : event.id;
                        setOpenEventId(nextOpen);
                        if (nextOpen && !registrationsByEvent[event.id]) {
                          loadRegistrations(event.id);
                        }
                      }}
                      className="inline-flex items-center bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
                      aria-expanded={openEventId === event.id}
                      aria-controls={`registrations-${event.id}`}
                    >
                      {openEventId === event.id ? 'Ẩn đăng ký' : 'Xem đăng ký'}
                    </button>
                  </div>

                  {openEventId === event.id && (
                    <div id={`registrations-${event.id}`} className="mt-3 border-t pt-3 overflow-x-auto">
                      {registrationsLoading[event.id] ? (
                        <div className="text-sm text-gray-500">Đang tải danh sách đăng ký...</div>
                      ) : (registrationsByEvent[event.id]?.length ?? 0) === 0 ? (
                        <div className="text-sm text-gray-500">Chưa có người đăng ký.</div>
                      ) : (
                        <div className="min-w-full max-h-56 overflow-auto rounded-lg ring-1 ring-gray-100">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700 sticky top-0">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium">Người dùng</th>
                                <th className="text-left px-3 py-2 font-medium">Liên hệ</th>
                                <th className="text-left px-3 py-2 font-medium">Tổ chức/Chức danh</th>
                                <th className="text-left px-3 py-2 font-medium">Thời gian</th>
                              </tr>
                            </thead>
                            <tbody>
                              {registrationsByEvent[event.id]?.map(r => (
                                <tr key={r.id} className="border-t">
                                  <td className="px-3 py-2 text-gray-900">{r.user?.name || '(Không tên)'}</td>
                                  <td className="px-3 py-2 text-gray-900">
                                    <div>{r.user?.email}</div>
                                    {r.user?.phone && <div className="text-xs text-gray-700">{r.user.phone}</div>}
                                  </td>
                                  <td className="px-3 py-2 text-gray-900">
                                    <div>{r.user?.organization || '-'}</div>
                                    {r.user?.jobTitle && <div className="text-xs text-gray-700">{r.user.jobTitle}</div>}
                                  </td>
                                  <td className="px-3 py-2 text-gray-700">{new Date(r.createdAt).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
