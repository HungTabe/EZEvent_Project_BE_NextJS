"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EventDetail {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: string;
  shareUrl?: string;
}

export default function QRScanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrCode = searchParams.get('qr');
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (!qrCode) {
      setError('Không có mã QR hợp lệ');
      setLoading(false);
      return;
    }

    const fetchEventByQR = async () => {
      try {
        const response = await fetch(`/api/events/qr?qr=${encodeURIComponent(qrCode!)}`);
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

    fetchEventByQR();
  }, [qrCode]);



  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth?returnUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    setRegistering(true);
    setError('');
    
    try {
      const response = await fetch('/api/events/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrCode })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Đăng ký sự kiện thành công! 🎉');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi QR Code</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/student/events')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Về trang sự kiện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-blue-600 text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký qua QR Code</h1>
          <p className="text-gray-600 mt-2">Quét mã QR để đăng ký tham gia sự kiện</p>
        </div>

        {/* Event Card */}
        {event && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
              <div className="flex items-center gap-4 text-blue-100 text-sm">
                <span>📅 {new Date(event.startTime).toLocaleDateString('vi-VN')}</span>
                <span>🕒 {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                {event.location && <span>📍 {event.location}</span>}
              </div>
            </div>
            <div className="p-6">
              {event.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Mô tả sự kiện</h3>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Thời gian bắt đầu</h4>
                  <p className="text-gray-900">{new Date(event.startTime).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Thời gian kết thúc</h4>
                  <p className="text-gray-900">{new Date(event.endTime).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {registering ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang đăng ký...
                    </span>
                  ) : (
                    '🎯 Đăng ký tham gia'
                  )}
                </button>
                <button
                  onClick={() => router.push('/student/events')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>💡 Bạn cần đăng nhập với tài khoản sinh viên để đăng ký sự kiện</p>
        </div>
      </div>
    </div>
  );
}