"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Event {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  qrCode?: string;
  shareUrl?: string;
  status: string;
}

export default function EventQRPage() {
  const params = useParams();
  const eventId = params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/detail?id=${eventId}`);
        const data = await res.json();
        setEvent(data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã copy vào clipboard!");
  };

  const generateQRCode = (text: string) => {
    // In a real app, you'd use a QR code library like qrcode.js
    // For now, we'll show a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Đang tải thông tin sự kiện...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-bold mb-2">Không tìm thấy sự kiện</h2>
            <p>Sự kiện không tồn tại hoặc đã bị xóa.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-purple-700">QR Code sự kiện</h1>
          <h2 className="text-xl font-semibold text-gray-800">{event.name}</h2>
          <p className="text-gray-600 mt-2">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-lg font-bold mb-6 text-blue-700">QR Code để chia sẻ</h3>
            
            {event.qrCode ? (
              <>
                <div className="mb-6">
                  <img
                    src={generateQRCode(event.shareUrl || '')}
                    alt="QR Code"
                    className="mx-auto border-4 border-gray-200 rounded-lg"
                    width="300"
                    height="300"
                  />
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => copyToClipboard(event.qrCode || '')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Copy QR Code
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(event.shareUrl || '')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Copy Link chia sẻ
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                <div className="text-4xl mb-4">📱</div>
                <p>QR Code chưa được tạo</p>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-lg font-bold mb-6 text-green-700">Thông tin sự kiện</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên sự kiện</label>
                <p className="text-gray-900 font-medium">{event.name}</p>
              </div>

              {event.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <p className="text-gray-900">{event.description}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                <p className="text-gray-900">{new Date(event.startTime).toLocaleString('vi-VN')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                <p className="text-gray-900">{new Date(event.endTime).toLocaleString('vi-VN')}</p>
              </div>

              {event.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status === 'APPROVED' ? 'Đã duyệt' :
                   event.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                </span>
              </div>
            </div>

            {event.shareUrl && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-blue-800 mb-2">Link chia sẻ</label>
                <div className="flex">
                  <input
                    type="text"
                    value={event.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-l-lg bg-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(event.shareUrl || '')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Hướng dẫn chia sẻ sự kiện</h3>
          <ul className="text-yellow-700 space-y-2 text-sm">
            <li>• <strong>In QR Code:</strong> In QR code để người tham gia có thể quét bằng điện thoại</li>
            <li>• <strong>Chia sẻ Link:</strong> Copy và chia sẻ link trực tiếp qua email, tin nhắn, mạng xã hội</li>
            <li>• <strong>Check-in:</strong> Người tham gia sẽ nhận được mã QR riêng sau khi đăng ký</li>
            <li>• <strong>Theo dõi:</strong> Sử dụng chức năng check-in để theo dõi người tham gia thực tế</li>
          </ul>
        </div>
      </div>
    </main>
  );
}








