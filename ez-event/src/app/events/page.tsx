"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import UserLayout from "../_components/UserLayout";

interface Event {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  imageUrl?: string;
  status: string;
  qrCode?: string;
  shareUrl?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function PublicEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [registerResult, setRegisterResult] = useState<{
    success: boolean;
    message: string;
    qrCodeImage?: string;
    qrCodeData?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch("/api/events/list");
        const data = await res.json();
        // Chỉ hiển thị sự kiện đã được duyệt
        const approvedEvents = (data.events || []).filter((event: Event) => event.status === 'APPROVED');
        setEvents(approvedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        id: parsedUser.id,
        name: parsedUser.name,
        email: parsedUser.email
      });
    }
  }, []);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRegister = async (eventId: number) => {
    if (!user) {
      alert("Vui lòng đăng nhập để đăng ký sự kiện");
      return;
    }

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, eventId }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setRegisterResult({
          success: true,
          message: data.message,
          qrCodeImage: data.qrCodeImage,
          qrCodeData: data.qrCodeData
        });
      } else {
        setRegisterResult({
          success: false,
          message: data.error
        });
      }
    } catch (error) {
      setRegisterResult({
        success: false,
        message: "Lỗi kết nối"
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <UserLayout>
      <div className="p-6">
        {/* Enhanced Page Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="mr-2">🎯</span>
            Khám phá & tham gia
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Sự kiện thú vị
            <span className="text-blue-600 block md:inline"> đang chờ bạn</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Tham gia những sự kiện đặc sắc, kết nối với cộng đồng và tạo ra những trải nghiệm đáng nhớ
          </p>
          {!user && (
            <div className="mx-auto max-w-lg">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <div className="text-3xl mb-3">👋</div>
                <p className="text-blue-900 font-medium mb-4 text-sm">
                  Đăng nhập để đăng ký tham gia sự kiện và nhận QR code cá nhân
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/auth"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors"
                  >
                    🔑 Đăng nhập
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl border-2 border-blue-600 hover:bg-blue-50 font-medium transition-colors"
                  >
                    📝 Đăng ký tài khoản
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Enhanced Search & Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sự kiện theo tên, mô tả..."
                  className="w-full px-4 py-3 pl-12 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <div className="text-sm text-gray-600 flex items-center px-3 py-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="font-medium">{filteredEvents.length}</span>
                  <span className="ml-1">sự kiện</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Đang tải sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy sự kiện</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              {searchTerm ? 'Không có sự kiện nào phù hợp với từ khóa tìm kiếm. Thử từ khóa khác nhé!' : 'Hiện tại chưa có sự kiện nào được công khai. Quay lại sau để khám phá!'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium"
              >
                🔄 Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.startTime);
              const now = new Date();
              const isUpcoming = eventDate > now;
              const isToday = eventDate.toDateString() === now.toDateString();
              
              return (
                <div key={event.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden">
                  {event.imageUrl ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        {isToday ? (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            📅 Hôm nay
                          </span>
                        ) : isUpcoming ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ⏰ Sắp diễn ra
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            📝 Đã kết thúc
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                      <span className="text-6xl text-white/80">🎯</span>
                      <div className="absolute top-4 right-4">
                        {isToday ? (
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                            📅 Hôm nay
                          </span>
                        ) : isUpcoming ? (
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ⏰ Sắp diễn ra
                          </span>
                        ) : (
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                            📝 Đã kết thúc
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.name}
                    </h3>
                    
                    {event.description && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600">📅</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{formatDateTime(event.startTime)}</div>
                          <div className="text-xs text-gray-600">
                            {isToday ? 'Hôm nay' : isUpcoming ? 
                              `Còn ${Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ngày` : 
                              'Đã kết thúc'
                            }
                          </div>
                        </div>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-green-600">📍</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{event.location}</div>
                            <div className="text-xs text-gray-600">Địa điểm tổ chức</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegisterForm(true);
                      }}
                      disabled={!isUpcoming}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        isUpcoming 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isUpcoming ? '🎫 Đăng ký tham gia' : '❌ Đã kết thúc'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Registration Modal */}
        {showRegisterForm && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Đăng ký sự kiện</h3>
                  <button
                    onClick={() => {
                      setShowRegisterForm(false);
                      setSelectedEvent(null);
                      setRegisterResult(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {!registerResult ? (
                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{selectedEvent.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{selectedEvent.description}</p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>📅 {formatDateTime(selectedEvent.startTime)}</div>
                        {selectedEvent.location && <div>📍 {selectedEvent.location}</div>}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowRegisterForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleRegister(selectedEvent.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                      >
                        Xác nhận đăng ký
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {registerResult.success ? (
                      <div>
                        <div className="text-4xl mb-4">🎉</div>
                        <h4 className="text-lg font-semibold text-green-800 mb-2">Đăng ký thành công!</h4>
                        <p className="text-gray-600 mb-4">{registerResult.message}</p>
                        
                        {registerResult.qrCodeImage && (
                          <>
                            <div className="mb-4 p-4 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-800 mb-3">🎫 Mã QR tham gia của bạn</p>
                              <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                                <img
                                  src={registerResult.qrCodeImage}
                                  alt="Personal QR Code"
                                  className="mx-auto"
                                  width="200"
                                  height="200"
                                />
                              </div>
                              <div className="mt-3 text-sm text-green-700">
                                <div className="font-medium mb-1">📱 Cách sử dụng:</div>
                                <div className="text-left space-y-1">
                                  <div>• Lưu ảnh QR về máy để dùng offline</div>
                                  <div>• Hoặc xem trong &quot;Trang cá nhân&quot;</div>
                                  <div>• Đưa QR cho BTC quét khi check-in</div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                              <div className="text-blue-800">
                                <div className="font-medium mb-1">📋 Thông tin sự kiện:</div>
                                <div>🎯 {selectedEvent?.name}</div>
                                <div>📍 {selectedEvent?.location || 'Chưa xác định'}</div>
                                <div>📅 {selectedEvent?.startTime ? formatDateTime(selectedEvent.startTime) : ''}</div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2">
                          {registerResult.qrCodeImage && (
                            <>
                              <a
                                href={registerResult.qrCodeImage}
                                download={`qr-${selectedEvent?.name}-${registerResult.qrCodeData}.png`}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
                              >
                                💾 Lưu QR
                              </a>
                              <button
                                onClick={() => {
                                  setShowRegisterForm(false);
                                  setSelectedEvent(null);
                                  setRegisterResult(null);
                                  window.location.href = '/user';
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
                              >
                                👤 Trang cá nhân
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setShowRegisterForm(false);
                              setSelectedEvent(null);
                              setRegisterResult(null);
                            }}
                            className={`${registerResult.qrCodeImage ? 'bg-gray-600 hover:bg-gray-700' : 'flex-1 bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded-lg text-sm`}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-4">❌</div>
                        <h4 className="text-lg font-semibold text-red-800 mb-2">Đăng ký thất bại</h4>
                        <p className="text-gray-600 mb-4">{registerResult.message}</p>
                        <button
                          onClick={() => {
                            setShowRegisterForm(false);
                            setSelectedEvent(null);
                            setRegisterResult(null);
                          }}
                          className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700"
                        >
                          Đóng
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
