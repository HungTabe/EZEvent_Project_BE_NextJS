"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import UserLayout from "../_components/UserLayout";

interface User {
  id: number;
  name?: string;
  email: string;
}

interface Registration {
  id: number;
  eventId: number;
  qrCode: string;
  checkedIn: boolean;
  createdAt: string;
  event: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    location?: string;
    status: string;
  };
}

export default function UserDashboard() {
  const [, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'checkedIn'>('all');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Lấy token từ localStorage (trong thực tế có thể dùng context hoặc cookie)
        const token = localStorage.getItem('token');
        if (!token) {
          // Nếu không có token, chuyển về trang auth
          window.location.href = '/auth';
          return;
        }

        // Lấy thông tin user từ localStorage
        const userData = localStorage.getItem('user');
        let currentUser;
        if (userData) {
          const parsedUser = JSON.parse(userData) as { id: number; name?: string; email: string };
          currentUser = {
            id: parsedUser.id,
            name: parsedUser.name,
            email: parsedUser.email
          };
        } else {
          // Fallback nếu không có thông tin user
          currentUser = {
            id: 1,
            name: "Nguyễn Văn A",
            email: "user@example.com"
          };
        }
        
        setUser(currentUser);

        // Fetch user's registrations from API
        const res = await fetch(`/api/user/registrations?userId=${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        
        if (res.ok && data.registrations) {
          // Chuyển đổi dữ liệu để phù hợp với interface
          const userRegistrations = data.registrations.map((reg: {
            id: number;
            eventId: number;
            qrCode: string | null;
            checkedIn: boolean;
            createdAt: string;
            event?: {
              id: number;
              name: string;
              description?: string;
              startTime: string;
              endTime: string;
              location?: string;
              status?: string;
            };
          }) => ({
            id: reg.id,
            eventId: reg.eventId,
            qrCode: reg.qrCode || "",
            checkedIn: reg.checkedIn || false,
            createdAt: reg.createdAt,
            event: {
              id: reg.event?.id || reg.eventId,
              name: reg.event?.name || "Sự kiện không xác định",
              startTime: reg.event?.startTime || new Date().toISOString(),
              endTime: reg.event?.endTime || new Date().toISOString(),
              location: reg.event?.location || "",
              status: reg.event?.status || "APPROVED"
            }
          }));

          setRegistrations(userRegistrations);
        } else {
          console.error('Error fetching registrations:', data.error);
          setRegistrations([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Set empty data nếu có lỗi
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate QR using library for better quality
  const generateQRCode = async (qrData: string) => {
    try {
      const QR = await import('qrcode');
      return await QR.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
    } catch {
      // Fallback to online service
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    }
  };

  const getStatusColor = (checkedIn: boolean) => {
    return checkedIn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (checkedIn: boolean) => {
    return checkedIn ? 'Đã check-in' : 'Chưa check-in';
  };

  const getEventTiming = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return { status: 'upcoming', text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
    if (now >= start && now <= end) return { status: 'ongoing', text: 'Đang diễn ra', color: 'bg-green-100 text-green-800' };
    return { status: 'past', text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reg.event.location && reg.event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    const timing = getEventTiming(reg.event.startTime, reg.event.endTime);
    switch (filterStatus) {
      case 'upcoming': return timing.status === 'upcoming';
      case 'past': return timing.status === 'past';
      case 'checkedIn': return reg.checkedIn;
      default: return true;
    }
  });

  const handleShowQR = async (registration: Registration) => {
    setSelectedRegistration(registration);
    const qrUrl = await generateQRCode(registration.qrCode);
    setQrImageUrl(qrUrl);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <UserLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Trang cá nhân</h1>
              <p className="text-gray-600">Quản lý sự kiện đã đăng ký và QR code cá nhân</p>
            </div>
          </div>
        </div>
        {/* Quick QR Access for Upcoming Events */}
        {(() => {
          const upcomingEvents = filteredRegistrations.filter(reg => {
            const timing = getEventTiming(reg.event.startTime, reg.event.endTime);
            return timing.status === 'upcoming';
          }).slice(0, 2);
          
          return upcomingEvents.length > 0 ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎫 Sự kiện sắp diễn ra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map(reg => (
                  <div key={reg.id} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{reg.event.name}</h4>
                        <p className="text-xs text-gray-600">{formatDateTime(reg.event.startTime)}</p>
                        {reg.event.location && (
                          <p className="text-xs text-gray-500">📍 {reg.event.location}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleShowQR(reg)}
                        className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 whitespace-nowrap"
                      >
                        📱 QR
                      </button>
                    </div>
                    <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      ⏰ {(() => {
                        const hours = Math.ceil((new Date(reg.event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                        if (hours <= 24) return `Còn ${hours} giờ`;
                        const days = Math.ceil(hours / 24);
                        return `Còn ${days} ngày`;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900">{registrations.length}</div>
                <div className="text-sm font-medium text-gray-600">Sự kiện đã đăng ký</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {registrations.filter(r => r.checkedIn).length}
                </div>
                <div className="text-sm font-medium text-gray-600">Đã tham gia</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {registrations.filter(r => !r.checkedIn).length}
                </div>
                <div className="text-sm font-medium text-gray-600">Chưa tham gia</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Thao tác nhanh</h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/student/events" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="mr-2">🎫</span>
              Khám phá sự kiện
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <span className="mr-2">🔄</span>
              Làm mới
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sự kiện..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'upcoming' | 'past' | 'checkedIn')}
              className="px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="all">Tất cả sự kiện</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="past">Đã kết thúc</option>
              <option value="checkedIn">Đã tham gia</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sự kiện đã đăng ký</h2>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{filteredRegistrations.length} / {registrations.length} sự kiện</span>
          </div>
          
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {registrations.length === 0 ? 'Chưa đăng ký sự kiện nào' : 'Không tìm thấy sự kiện phù hợp'}
              </h3>
              <p className="text-gray-500 mb-4">
                {registrations.length === 0 ? 'Hãy khám phá và đăng ký các sự kiện thú vị' : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
              </p>
              <Link href="/events" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {registrations.length === 0 ? 'Khám phá sự kiện' : 'Xem tất cả sự kiện'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => {
                const timing = getEventTiming(registration.event.startTime, registration.event.endTime);
                return (
                <div key={registration.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {registration.event.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${timing.color}`}>
                          {timing.text}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{formatDateTime(registration.event.startTime)}</span>
                          <span className="text-gray-400">→</span>
                          <span>{formatDateTime(registration.event.endTime)}</span>
                        </div>
                        {registration.event.location && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{registration.event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>🆔</span>
                          <span>Mã đăng ký: {registration.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.checkedIn)}`}>
                        {getStatusText(registration.checkedIn)}
                      </span>
                      <button
                        onClick={() => handleShowQR(registration)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Xem QR Code
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Enhanced QR Code Modal */}
        {selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">QR Code tham gia</h3>
                  <button
                    onClick={() => {
                      setSelectedRegistration(null);
                      setQrImageUrl(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {selectedRegistration.event.name}
                    </h4>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(selectedRegistration.event.startTime)}
                    </div>
                  </div>
                  
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    {qrImageUrl ? (
                      <Image
                        src={qrImageUrl}
                        alt="Personal QR Code"
                        className="mx-auto border-2 border-gray-200 rounded-lg"
                        width={250}
                        height={250}
                      />
                    ) : (
                      <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-gray-500">Đang tạo QR...</div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span>🆔 Mã:</span>
                      <code className="text-xs bg-white px-2 py-1 rounded">{selectedRegistration.qrCode}</code>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span>📅 Check-in:</span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedRegistration.checkedIn)}`}>
                        {getStatusText(selectedRegistration.checkedIn)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-yellow-800 text-sm">
                      💡 <strong>Lưu ý:</strong> Hãy lưu ảnh QR code này và mang theo khi tham gia sự kiện để check-in.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {qrImageUrl && (
                      <a
                        href={qrImageUrl}
                        download={`qr-${selectedRegistration.event.name}-${selectedRegistration.id}.png`}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
                      >
                        💾 Tải về
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedRegistration(null);
                        setQrImageUrl(null);
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}