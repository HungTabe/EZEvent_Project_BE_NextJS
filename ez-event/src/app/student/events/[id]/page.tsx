"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface EventDetail {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: string;
  shareUrl?: string;
  imageUrl?: string;
  creator?: {
    name?: string;
    email?: string;
    organization?: string;
  };
}

export default function StudentEventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = Number(params?.id);
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      router.push('/student/events');
      return;
    }

    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`/api/events/detail?eventId=${eventId}`);
        const data = await response.json();

        if (response.ok) {
          setEvent(data.event);
        } else {
          setError(data.error || 'Không thể tải thông tin sự kiện');
        }
      } catch {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    const checkRegistrationStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`/api/user/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const isRegistered = data.registrations.some((reg: { event: { id: number } }) => reg.event.id === eventId);
          setRegistered(isRegistered);
        }
      } catch {
        // Ignore error for registration check
      }
    };

    fetchEventDetail();
    checkRegistrationStatus();
  }, [eventId, router]);



  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth?returnUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    setRegistering(true);
    setError('');
    
    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Đăng ký sự kiện thành công! 🎉');
        setRegistered(true);
        setTimeout(() => {
          router.push('/student/events');
        }, 2000);
      } else {
        setError(data.error || 'Đăng ký thất bại');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sự kiện</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/student/events"
            className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Về trang sự kiện
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết sự kiện</h1>
              <p className="text-gray-600 text-sm">Thông tin chi tiết và đăng ký tham gia</p>
            </div>
            <Link 
              href="/student/events"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              ← Quay lại
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pt-8">
        {/* Event Card */}
        {event && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3">{event.name}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <div className="text-xs opacity-75">Ngày tổ chức</div>
                        <div className="font-medium">{new Date(event.startTime).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕒</span>
                      <div>
                        <div className="text-xs opacity-75">Thời gian</div>
                        <div className="font-medium">
                          {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <div>
                          <div className="text-xs opacity-75">Địa điểm</div>
                          <div className="font-medium">{event.location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status === 'APPROVED' ? 'Đã phê duyệt' :
                     event.status === 'PENDING' ? 'Chờ phê duyệt' :
                     'Đã hủy'}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Description */}
              {event.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">📝 Mô tả sự kiện</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              )}

              {/* Event Image */}
              {event.imageUrl && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">🖼️ Hình ảnh sự kiện</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-md">
                      <Image 
                        src={event.imageUrl} 
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Thông tin chi tiết</h2>
                <div className={`grid gap-6 ${event.imageUrl ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Thời gian bắt đầu</h3>
                    <p className="text-blue-800">{new Date(event.startTime).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h3 className="font-medium text-indigo-900 mb-2">Thời gian kết thúc</h3>
                    <p className="text-indigo-800">{new Date(event.endTime).toLocaleString('vi-VN')}</p>
                  </div>
                  {event.location && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="font-medium text-purple-900 mb-2">Địa điểm</h3>
                      <p className="text-purple-800">{event.location}</p>
                    </div>
                  )}
                  {event.creator && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-medium text-green-900 mb-2">Người tổ chức</h3>
                      <p className="text-green-800">{event.creator.name || event.creator.email}</p>
                      {event.creator.organization && (
                        <p className="text-green-600 text-sm">{event.creator.organization}</p>
                      )}
                    </div>
                  )}
                  {event.imageUrl && (
                    <div className="bg-pink-50 rounded-xl p-4">
                      <h3 className="font-medium text-pink-900 mb-2">Hình ảnh</h3>
                      <a 
                        href={event.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-800 hover:text-pink-900 hover:underline break-all text-sm"
                      >
                        {event.imageUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-600">{success}</p>
                </div>
              )}

              {/* Action Section */}
              <div className="border-t pt-6">
                {event.status !== 'APPROVED' ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sự kiện chưa được phê duyệt</h3>
                    <p className="text-gray-600">Vui lòng quay lại sau khi sự kiện được phê duyệt.</p>
                  </div>
                ) : registered ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-green-600 mb-2">Bạn đã đăng ký sự kiện này!</h3>
                    <p className="text-gray-600 mb-4">Cảm ơn bạn đã đăng ký. Hãy chuẩn bị tham gia sự kiện nhé!</p>
                    <Link
                      href="/student/events"
                      className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Xem các sự kiện khác
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                    >
                      {registering ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Đang đăng ký...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🎯</span>
                          Đăng ký tham gia ngay
                        </>
                      )}
                    </button>
                    <p className="text-gray-500 text-sm mt-3">
                      💡 Miễn phí • Có thể hủy đăng ký • Nhận thông báo qua email
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Lưu ý</h3>
          <p className="text-gray-600 text-sm">
            Sau khi đăng ký thành công, bạn sẽ nhận được email xác nhận và có thể check-in tại sự kiện bằng QR code.
          </p>
        </div>
      </main>
    </div>
  );
}