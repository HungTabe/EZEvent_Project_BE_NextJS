"use client";
import Link from "next/link";
import Image from "next/image";
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


  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      router.push('/organizer/events');
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
      if (tab === 'registrations' || tab === 'participants') {
        setLoadingRegistrations(true);
        setLoadingParticipants(true);
        try {
          const res = await fetch(`/api/events/participants?eventId=${eventId}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          if (res.ok) {
            setRegistrations(data.registrations ?? []);
            setParticipants(data.participants ?? []);
          } else {
            console.error('Error loading participants:', data.error);
            setRegistrations([]);
            setParticipants([]);
          }
        } finally {
          setLoadingRegistrations(false);
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
          const res = await fetch(`/api/events/participants?eventId=${eventId}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          if (res.ok) {
            const totalRegistrations = data.total ?? 0;
            const totalCheckins = data.checkedIn ?? 0;
            const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckins / totalRegistrations) * 100) : 0;
            setReport({
              totalRegistrations,
              totalCheckins,
              attendanceRate,
            });
          }
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
        // Tạo URL cho QR scan page
        const qrUrl = `${window.location.origin}/qr?qr=${encodeURIComponent(event.qrCode)}`;
        const dataUrl = await QR.toDataURL(qrUrl, {
          width: 240,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrImage(dataUrl);
      } catch {
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
          <Link href="/organizer/events" className="text-sm text-blue-700 hover:underline">← Quay lại danh sách</Link>
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
                  <Link
                    href={`/organizer/events/${event.id}/participants`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Quản lý tham gia
                  </Link>
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
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Tổng đăng ký</p>
                        <p className="text-2xl font-bold text-blue-900">{registrations.length}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-lg">📝</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Đã check-in</p>
                        <p className="text-2xl font-bold text-green-900">{participants.length}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <span className="text-lg">✅</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-600">Chưa check-in</p>
                        <p className="text-2xl font-bold text-yellow-900">{registrations.length - participants.length}</p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-lg">⏳</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Tỷ lệ tham gia</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {registrations.length > 0 ? Math.round((participants.length / registrations.length) * 100) : 0}%
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Event Image */}
                  {event?.imageUrl && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-2">Ảnh sự kiện</div>
                      <Image 
                        src={event.imageUrl} 
                        alt={event.name}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <div className={`${event?.imageUrl ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4 text-gray-900`}>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Thông tin sự kiện</div>
                      <div className="space-y-3">
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
                          <div className="text-xs text-gray-600">Ảnh sự kiện</div>
                          <div className="text-sm">
                            {event?.imageUrl ? (
                              <a href={event.imageUrl} target="_blank" className="text-blue-600 hover:underline">
                                🖼️ Xem ảnh
                              </a>
                            ) : '—'}
                          </div>
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
                            <>
                              <button
                                onClick={() => navigator.clipboard.writeText(event.shareUrl || '')}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm border border-blue-600 text-blue-700 hover:bg-blue-50"
                              >Copy Link</button>
                              <a href={event.shareUrl} target="_blank" className="text-blue-700 hover:underline text-sm">🔗 Mở trang sự kiện</a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-600 mb-2">Mã QR đăng ký sự kiện</div>
                    {qrImage ? (
                      <>
                        <Image src={qrImage} alt="Event QR" width={192} height={192} className="bg-white rounded-md shadow-sm border" />
                        <div className="mt-3 text-center">
                          <a
                            href={qrImage}
                            download={`event-${event?.id}-qr.png`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-gray-900 text-white hover:bg-black mr-2"
                          >Tải QR</a>
                        </div>
                      </>
                    ) : event?.qrCode ? (
                      <>
                        <div className="w-48 h-48 bg-white rounded-md shadow-sm border flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📱</div>
                            <div className="text-sm">QR đang tải...</div>
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] text-gray-500 break-all font-mono bg-gray-100 p-2 rounded">{event.qrCode}</div>
                      </>
                    ) : (
                      <div className="w-48 h-48 bg-white rounded-md shadow-sm border flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">❌</div>
                          <div className="text-sm">Chưa có QR code</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'registrations' && (
              <div>
                {loadingRegistrations ? (
                  <div className="text-gray-600">Đang tải đăng ký...</div>
                ) : registrations.length === 0 ? (
                  <div className="text-gray-600">Chưa có đăng ký nào.</div>
                ) : (
                  <div className="min-w-full overflow-auto rounded-lg ring-1 ring-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Người dùng</th>
                          <th className="text-left px-3 py-2 font-medium">Email</th>
                          <th className="text-left px-3 py-2 font-medium">Tổ chức</th>
                          <th className="text-left px-3 py-2 font-medium">Ngày đăng ký</th>
                          <th className="px-3 py-2 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="px-3 py-2 text-gray-900">{r.user?.name || '(Không tên)'}</td>
                            <td className="px-3 py-2 text-gray-900">{r.user?.email}</td>
                            <td className="px-3 py-2 text-gray-900">
                              <div>{r.user?.organization || '-'}</div>
                              {r.user?.jobTitle && <div className="text-xs text-gray-700">{r.user.jobTitle}</div>}
                            </td>
                            <td className="px-3 py-2 text-gray-900">{new Date(r.createdAt).toLocaleString()}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${r.checkedIn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {r.checkedIn ? 'Đã check-in' : 'Chưa check-in'}
                              </span>
                            </td>
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
                  <div className="text-gray-600">Chưa có người tham gia (đã check-in).</div>
                ) : (
                  <div className="min-w-full overflow-auto rounded-lg ring-1 ring-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Người dùng</th>
                          <th className="text-left px-3 py-2 font-medium">Email</th>
                          <th className="text-left px-3 py-2 font-medium">Tổ chức/Chức danh</th>
                          <th className="text-left px-3 py-2 font-medium">Check-in lúc</th>
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
                            <td className="px-3 py-2 text-gray-900">{new Date(r.createdAt).toLocaleString()}</td>
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


