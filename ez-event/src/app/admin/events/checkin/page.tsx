"use client";
import { useState, useCallback, useEffect, useRef } from "react";

interface CheckinResult {
  success: boolean;
  message: string;
  registration?: { id: number; userId: number; eventId: number };
}

export default function CheckinPage() {
  const [qrCode, setQrCode] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  interface RecentCheckin { id: number; userId: number; eventId: number }
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrcodeRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  const performCheckin = useCallback(async (qr: string) => {
    if (!qr.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch("/api/admin/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ qrCode: qr.trim(), eventId: eventId ? Number(eventId) : undefined }),
      });
      const data = await res.json();
      setResult({ success: res.ok, message: data.message || data.error, registration: data.registration });
      if (res.ok) {
        setQrCode("");
        setRecentCheckins(prev => [data.registration, ...prev.slice(0, 4)]);
      }
    } catch {
      setResult({ success: false, message: "Lỗi kết nối" });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;
    await performCheckin(qrCode);
  };

  // Initialize/cleanup html5-qrcode scanner
  useEffect(() => {
    let isMounted = true;
    async function setup() {
      if (!showScanner || !scannerRef.current) return;
      const { Html5Qrcode } = await import('html5-qrcode');
      const elementId = 'qr-reader-container';
      if (!scannerRef.current.querySelector(`#${elementId}`)) {
        const div = document.createElement('div');
        div.id = elementId;
        scannerRef.current.appendChild(div);
      }
      type Html5QrcodeLike = { start: (c: unknown, cfg: unknown, cb: (text: string) => void, fail?: unknown) => Promise<void>; stop: () => Promise<void>; clear: () => void };
      const qr: Html5QrcodeLike = new Html5Qrcode(elementId) as unknown as Html5QrcodeLike;
      html5QrcodeRef.current = qr as { stop: () => Promise<void>; clear: () => void };
      await qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, (decodedText: string) => {
        if (!isMounted) return;
        setQrCode(decodedText);
        setShowScanner(false);
        void performCheckin(decodedText);
      }, undefined);
    }
    setup();
    return () => {
      isMounted = false;
      const qr = html5QrcodeRef.current;
      if (qr) {
        try { qr.stop().then(() => qr.clear()); } catch {}
      }
      html5QrcodeRef.current = null;
      const container = scannerRef.current;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [showScanner, performCheckin]);

  // Camera scanning handled by react-qr-reader

  return (
    <main className="min-h-screen bg-gray-50 p-2 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Quản lý Check-in</h1>
          <p className="text-gray-600 text-sm">Quét QR hoặc nhập mã thủ công để check-in người tham gia.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Check-in Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-6 text-blue-700">Check-in người tham gia</h2>
            
            {/* Camera Scanner */}
            <div className="mb-6">
              <div className="mb-3">
                <button
                  onClick={() => setShowScanner(s => !s)}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-medium"
                  type="button"
                >
                  {showScanner ? 'Tắt camera' : '📷 Quét bằng Camera'}
                </button>
              </div>
              {showScanner && (
                <div ref={scannerRef} className="rounded-lg overflow-hidden border" />
              )}
              <div className="text-center text-gray-500 text-sm mt-2">
                Yêu cầu HTTPS (ngrok OK). Hoặc nhập mã thủ công bên dưới.
              </div>
            </div>

            {/* Manual QR Input */}
            <form onSubmit={handleCheckin} className="space-y-4">
              <div>
                <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
                  Event ID (tuỳ chọn)
                </label>
                <input
                  type="number"
                  id="eventId"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nhập Event ID để kiểm tra QR thuộc sự kiện"
                />
              </div>
              <div>
                <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã QR Code
                </label>
                <input
                  type="text"
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  placeholder="Nhập hoặc dán mã QR code..."
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !qrCode.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Đang xử lý..." : "Check-in"}
              </button>
            </form>

            {/* Result Display */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${
                result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                <div className="font-medium">
                  {result.success ? "✅ Check-in thành công!" : "❌ Check-in thất bại"}
                </div>
                <div className="text-sm mt-1">{result.message}</div>
                {result.registration && (
                  <div className="text-sm mt-2 bg-white bg-opacity-50 p-2 rounded">
                    <div>ID: {result.registration.id}</div>
                    <div>User ID: {result.registration.userId}</div>
                    <div>Event ID: {result.registration.eventId}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-6 text-green-700">Check-in gần đây</h2>
            
            {recentCheckins.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <div>Chưa có check-in nào</div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckins.map((checkin, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-green-800">
                        Check-in #{checkin.id}
                      </div>
                      <div className="text-xs text-green-600">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      User ID: {checkin.userId} | Event ID: {checkin.eventId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Hướng dẫn sử dụng</h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• <strong>Quét bằng Camera:</strong> Sử dụng camera để quét QR code từ điện thoại người tham gia</li>
            <li>• <strong>Nhập thủ công:</strong> Nếu camera không hoạt động, có thể nhập mã QR code trực tiếp</li>
            <li>• <strong>Kết quả:</strong> Hệ thống sẽ hiển thị kết quả check-in ngay lập tức</li>
            <li>• <strong>Lịch sử:</strong> Xem danh sách các check-in gần đây để theo dõi</li>
          </ul>
        </div>
      </div>
    </main>
  );
}



