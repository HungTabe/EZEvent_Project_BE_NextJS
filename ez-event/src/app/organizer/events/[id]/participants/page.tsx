"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Participant {
  id: number;
  userId: number;
  eventId: number;
  qrCode: string | null;
  checkedIn: boolean;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    name?: string | null;
  }
}

export default function AdminEventParticipantsPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterChecked, setFilterChecked] = useState<'ALL'|'CHECKED_IN'|'NOT_CHECKED_IN'>("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch(`/api/admin/events/participants?eventId=${eventId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      setParticipants(data.participants || []);
      setLoading(false);
    }
    if (!isNaN(eventId)) load();
  }, [eventId]);

  const filtered = useMemo(() => {
    return participants
      .filter(p => {
        if (filterChecked === 'CHECKED_IN') return p.checkedIn;
        if (filterChecked === 'NOT_CHECKED_IN') return !p.checkedIn;
        return true;
      })
      .filter(p => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          String(p.id).includes(q) ||
          String(p.userId).includes(q) ||
          (p.user?.email || '').toLowerCase().includes(q) ||
          (p.user?.name || '').toLowerCase().includes(q) ||
          (p.qrCode || '').toLowerCase().includes(q)
        );
      });
  }, [participants, search, filterChecked]);

  const exportCsv = () => {
    const rows = [
      ['RegistrationID','UserID','Email','Name','EventID','QR','CheckedIn','CreatedAt'],
      ...filtered.map(p => [
        p.id, p.userId, p.user?.email || '', p.user?.name || '', p.eventId,
        p.qrCode || '', p.checkedIn ? 'YES' : 'NO', new Date(p.createdAt).toISOString()
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_event_${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Danh sách người tham gia</h1>
            <p className="text-gray-600">Sự kiện #{eventId}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/events/${eventId}`} className="px-4 py-2 border rounded-lg">Quay lại sự kiện</Link>
            <button onClick={exportCsv} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Xuất CSV</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo email, tên, QR, UserID, RegistrationID"
              className="px-3 py-2 border rounded-lg"
            />
            <select
              value={filterChecked}
              onChange={e => setFilterChecked(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="ALL">Tất cả</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="NOT_CHECKED_IN">Chưa check-in</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có người tham gia</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Reg ID</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">QR</th>
                    <th className="text-center py-3 px-4">Checked-in</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{p.id}</td>
                      <td className="py-3 px-4">{p.user?.name || `User #${p.userId}`}</td>
                      <td className="py-3 px-4">{p.user?.email}</td>
                      <td className="py-3 px-4 text-xs">{p.qrCode}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${p.checkedIn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {p.checkedIn ? 'Đã check-in' : 'Chưa check-in'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}





