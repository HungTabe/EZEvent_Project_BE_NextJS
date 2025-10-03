"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEventPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    
    setMessage("");
    setLoading(true);
    
    const token = localStorage.getItem("token");
    const res = await fetch("/api/events/create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, startTime, endTime, location, imageUrl }),
    });
    const data = await res.json();
    
    if (data.error) {
      setMessage(data.error);
      setLoading(false);
    } else {
      setMessage("🎉 Tạo sự kiện thành công và đã được phê duyệt tự động! QR code đã sẵn sàng.");
      setTimeout(() => router.push("/organizer/events"), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/organizer" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <span>→</span>
          <Link href="/organizer/events" className="hover:text-blue-600 transition-colors">Sự kiện</Link>
          <span>→</span>
          <span className="text-gray-900 font-medium">Tạo mới</span>
        </nav>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">✨</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Tạo sự kiện mới</h1>
              <p className="text-gray-600">Điền thông tin chi tiết để tạo sự kiện của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện *</label>
                <input
                  type="text"
                  placeholder="Nhập tên sự kiện..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả sự kiện</label>
                <textarea
                  placeholder="Mô tả chi tiết về sự kiện..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm</label>
                <input
                  type="text"
                  placeholder="Nơi tổ chức sự kiện..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Ảnh sự kiện</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Time Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Thời gian tổ chức
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thời gian bắt đầu *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thời gian kết thúc *</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Link href="/organizer/events" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300">
                <span className="mr-2">←</span>
                Quay lại
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Tạo sự kiện
                  </>
                )}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 p-4 rounded-xl text-center font-semibold ${
                message.includes("thành công") 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
