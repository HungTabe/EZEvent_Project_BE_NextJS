"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface EventDetail {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  imageUrl?: string;
  status: EventStatus;
  shareUrl?: string;
  qrCode?: string;
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
  qrCode?: string;
  checkedIn: boolean;
  createdAt: string;
  user?: RegistrationUser;
}

interface EventRoleItem {
  id: number;
  userId: number;
  eventId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user?: RegistrationUser;
}

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = Number(params?.id);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [tab, setTab] = useState<'overview' | 'participants' | 'registrations' | 'roles' | 'reports'>('overview');

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [roles, setRoles] = useState<EventRoleItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [report, setReport] = useState<{ totalRegistrations: number; totalCheckins: number; attendanceRate: number } | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : ''), []);
  const [qrImage, setQrImage] = useState<string | null>(null);

  async function handleApprove(nextStatus: 'APPROVED' | 'REJECTED') {
    if (!event) return;
    try {
      const res = await fetch('/api/admin/events/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ eventId, status: nextStatus })
      });
      if (res.ok) {
        setEvent(prev => prev ? { ...prev, status: nextStatus } : prev);
      }
    } catch (_e) {
      // noop
    }
  }

  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      router.push('/admin/events');
      return;
    }
    async function loadEvent() {
      try {
        setLoadingEvent(true);
        const res = await fetch(`/api/events/detail?id=${eventId}`);
        const data = await res.json();
        setEvent(data.event ?? null);
      } finally {
        setLoadingEvent(false);
      }
    }
    loadEvent();
  }, [eventId, router]);

  useEffect(() => {
    async function run() {
      if (tab === 'registrations') {
        setLoadingRegistrations(true);
        try {
          const res = await fetch(`/api/admin/events/registrations?eventId=${eventId}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          setRegistrations(data.registrations ?? []);
        } finally {
          setLoadingRegistrations(false);
        }
      } else if (tab === 'participants') {
        setLoadingParticipants(true);
        try {
          const res = await fetch(`/api/admin/events/participants?eventId=${eventId}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          setParticipants(data.participants ?? []);
        } finally {
          setLoadingParticipants(false);
        }
      } else if (tab === 'roles') {
        setLoadingRoles(true);
        try {
          const res = await fetch(`/api/events/roles?eventId=${eventId}`);
          const data = await res.json();
          setRoles(data.roles ?? []);
        } finally {
          setLoadingRoles(false);
        }
      } else if (tab === 'reports') {
        setLoadingReport(true);
        try {
          const res = await fetch(`/api/admin/events/report?eventId=${eventId}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          setReport({
            totalRegistrations: data.totalRegistrations ?? 0,
            totalCheckins: data.totalCheckins ?? 0,
            attendanceRate: data.attendanceRate ?? 0,
          });
        } finally {
          setLoadingReport(false);
        }
      }
    }
    run();
  }, [tab, eventId, token]);

  useEffect(() => {
    async function genQr() {
      if (!event?.qrCode) {
        setQrImage(null);
        return;
      }
      try {
        const QR = await import('qrcode');
        const dataUrl = await QR.toDataURL(event.qrCode, {
          width: 240,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrImage(dataUrl);
      } catch (_e) {
        setQrImage(null);
      }
    }
    genQr();
  }, [event?.qrCode]);

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'participants', label: 'Người tham gia' },
    { key: 'registrations', label: 'Đăng ký' },
    { key: 'roles', label: 'Phân quyền' },
    { key: 'reports', label: 'Báo cáo' },
  ];

  function getStatusStyles(status?: EventStatus) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Chi tiết sự kiện</h1>
            <p className="text-gray-600 text-sm">Quản lý thông tin, người tham gia và báo cáo</p>
          </div>
          <Link href="/admin/events" className="text-sm text-blue-700 hover:underline">← Quay lại danh sách</Link>
        </div>

        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 mb-4">
          {loadingEvent ? (
            <div className="text-gray-600">Đang tải thông tin sự kiện...</div>
          ) : !event ? (
            <div className="text-red-600">Không tìm thấy sự kiện.</div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">{event.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyles(event.status)}`}>{event.status}</span>
                  {event.shareUrl && (
                    <button
                      onClick={() => navigator.clipboard.writeText(event.shareUrl || '')}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm border border-blue-600 text-blue-700 hover:bg-blue-50"
                    >Copy Link</button>
                  )}
                  {event.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove('APPROVED')}
                        className="inline-flex items-center bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                        aria-label="Duyệt sự kiện"
                      >Duyệt</button>
                      <button
                        onClick={() => handleApprove('REJECTED')}
                        className="inline-flex items-center bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700"
                        aria-label="Từ chối sự kiện"
                      >Từ chối</button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-700">{event.description || '—'}</div>
              <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                {event.location && <span>📍 {event.location}</span>}
                {event.startTime && <span>🕒 {new Date(event.startTime).toLocaleString()}</span>}
                {event.endTime && <span>⏳ {new Date(event.endTime).toLocaleString()}</span>}
              </div>
            </div>
          )}
        </section>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
          <div className="border-b flex overflow-x-auto gap-1 p-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${tab === t.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >{t.label}</button>
            ))}
          </div>

          <div className="p-4 sm:p-5 overflow-x-auto">
            {tab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="md:col-span-2 space-y-2 text-gray-900">
                  <div>
                    <div className="text-xs text-gray-600">Tên sự kiện</div>
                    <div className="font-medium">{event?.name}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600">Bắt đầu</div>
                      <div>{event?.startTime ? new Date(event.startTime).toLocaleString() : '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Kết thúc</div>
                      <div>{event?.endTime ? new Date(event.endTime).toLocaleString() : '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Địa điểm</div>
                    <div>{event?.location || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Trạng thái</div>
                    <div><span className={`text-xs px-2 py-1 rounded-full ${getStatusStyles(event?.status)}`}>{event?.status}</span></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Mô tả</div>
                    <div className="text-gray-800">{event?.description || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event?.shareUrl && (
                      <button
                        onClick={() => navigator.clipboard.writeText(event.shareUrl || '')}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm border border-blue-600 text-blue-700 hover:bg-blue-50"
                      >Copy Link</button>
                    )}
                    {event?.shareUrl && (
                      <a href={event.shareUrl} target="_blank" className="text-blue-700 hover:underline text-sm">Mở trang sự kiện</a>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-600 mb-2">Mã QR sự kiện</div>
                  {qrImage ? (
                    <img src={qrImage} alt="Event QR" className="w-48 h-48 bg-white rounded-md shadow-sm border" />
                  ) : (
                    <div className="text-gray-600 text-xs">Không có mã QR</div>
                  )}
                  {qrImage && (
                    <a
                      href={qrImage}
                      download={`event-${event?.id}-qr.png`}
                      className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-gray-900 text-white hover:bg-black"
                    >Tải QR</a>
                  )}
                  {!qrImage && event?.qrCode && (
                    <div className="mt-2 text-[11px] text-gray-500 break-all">{event.qrCode}</div>
                  )}
                </div>
              </div>
            )}

            {tab === 'registrations' && (
              <div>
                {loadingRegistrations ? (
                  <div className="text-gray-600">Đang tải đăng ký...</div>
                ) : registrations.length === 0 ? (
                  <div className="text-gray-600">Chưa có đăng ký.</div>
                ) : (
                  <div className="min-w-full overflow-auto rounded-lg ring-1 ring-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Người dùng</th>
                          <th className="text-left px-3 py-2 font-medium">Email</th>
                          <th className="text-left px-3 py-2 font-medium">Check-in</th>
                          <th className="text-left px-3 py-2 font-medium">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="px-3 py-2 text-gray-900">{r.user?.name || '(Không tên)'}</td>
                            <td className="px-3 py-2 text-gray-900">{r.user?.email}</td>
                            <td className="px-3 py-2">{r.checkedIn ? '✅' : '—'}</td>
                            <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'participants' && (
              <div>
                {loadingParticipants ? (
                  <div className="text-gray-600">Đang tải người tham gia...</div>
                ) : participants.length === 0 ? (
                  <div className="text-gray-600">Chưa có người tham gia.</div>
                ) : (
                  <div className="min-w-full overflow-auto rounded-lg ring-1 ring-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Người dùng</th>
                          <th className="text-left px-3 py-2 font-medium">Email</th>
                          <th className="text-left px-3 py-2 font-medium">Tổ chức/Chức danh</th>
                          <th className="text-left px-3 py-2 font-medium">Đăng ký lúc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="px-3 py-2 text-gray-900">{r.user?.name || '(Không tên)'}</td>
                            <td className="px-3 py-2 text-gray-900">{r.user?.email}</td>
                            <td className="px-3 py-2 text-gray-900">
                              <div>{r.user?.organization || '-'}</div>
                              {r.user?.jobTitle && <div className="text-xs text-gray-700">{r.user.jobTitle}</div>}
                            </td>
                            <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'roles' && (
              <div>
                {loadingRoles ? (
                  <div className="text-gray-600">Đang tải phân quyền...</div>
                ) : roles.length === 0 ? (
                  <div className="text-gray-600">Chưa có phân quyền.</div>
                ) : (
                  <ul className="text-sm text-gray-700 space-y-2">
                    {roles.map(role => (
                      <li key={role.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                        <div>
                          <div className="font-medium">{role.user?.name || '(Không tên)'}</div>
                          <div className="text-xs text-gray-500">{role.user?.email}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{role.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === 'reports' && (
              <div className="text-sm text-gray-700">
                {loadingReport ? (
                  <div className="text-gray-600">Đang tải báo cáo...</div>
                ) : !report ? (
                  <div className="text-gray-600">Chưa có dữ liệu báo cáo.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl p-4 bg-gray-50">
                      <div className="text-xs text-gray-600">Tổng đăng ký</div>
                      <div className="text-2xl font-bold text-gray-900">{report.totalRegistrations}</div>
                    </div>
                    <div className="rounded-xl p-4 bg-gray-50">
                      <div className="text-xs text-gray-600">Đã check-in</div>
                      <div className="text-2xl font-bold text-gray-900">{report.totalCheckins}</div>
                    </div>
                    <div className="rounded-xl p-4 bg-gray-50">
                      <div className="text-xs text-gray-600">Tỉ lệ tham dự</div>
                      <div className="text-2xl font-bold text-gray-900">{report.attendanceRate}%</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


