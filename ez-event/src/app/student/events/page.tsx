"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  creator: {
    name: string | null;
    email: string;
  };
  participantCount: number;
  isRegistered: boolean;
  registrationId?: number | null;
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registering, setRegistering] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAvailableEvents();
  }, []);

  async function fetchAvailableEvents() {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;
      
      const res = await fetch(`/api/events/available${userId ? `?userId=${userId}` : ''}`);
      const data = await res.json();
      
      if (res.ok) {
        setEvents(data.events || []);
      } else {
        console.error('Error fetching events:', data.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(eventId: number) {
    try {
      setRegistering(eventId);
      setMessage("");
      
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        setMessage("Vui lòng đăng nhập để đăng ký sự kiện");
        return;
      }

      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, eventId }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("Đăng ký sự kiện thành công!");
        // Refresh events list
        fetchAvailableEvents();
      } else {
        setMessage(data.error || "Có lỗi xảy ra khi đăng ký");
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      setMessage("Có lỗi xảy ra khi đăng ký");
    } finally {
      setRegistering(null);
    }
  }

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return { status: 'upcoming', label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
    if (now >= start && now <= end) return { status: 'ongoing', label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' };
    return { status: 'ended', label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/student" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <span>→</span>
          <span className="text-gray-900 font-medium">Sự kiện có sẵn</span>
        </nav>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">🎫</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Sự kiện có sẵn</h1>
              <p className="text-gray-600">Khám phá và đăng ký tham gia các sự kiện thú vị</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className={`p-4 rounded-xl text-center font-semibold ${
            message.includes("thành công") 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {message}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-4xl">🎪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có sự kiện nào</h3>
            <p className="text-gray-600">
              {events.length === 0 
                ? "Hiện tại chưa có sự kiện nào được tổ chức." 
                : "Không tìm thấy sự kiện nào phù hợp với tìm kiếm của bạn."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event.startTime, event.endTime);
              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Event Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color} flex-shrink-0 ml-2`}>
                        {eventStatus.label}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{event.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(event.startTime).toLocaleString('vi-VN')}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{event.participantCount} người tham gia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👨‍💼</span>
                        <span className="line-clamp-1">
                          {event.creator.name || event.creator.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    {event.isRegistered ? (
                      <div className="flex items-center gap-2">
                        <button className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-medium cursor-default">
                          ✓ Đã đăng ký
                        </button>
                        <Link 
                          href="/student"
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
                        >
                          Xem QR
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={registering === event.id || eventStatus.status === 'ended'}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {registering === event.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang đăng ký...
                          </span>
                        ) : eventStatus.status === 'ended' ? (
                          "Đã kết thúc"
                        ) : (
                          "Đăng ký tham gia"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}