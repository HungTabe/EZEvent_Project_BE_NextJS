import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-2 md:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-blue-700">Quản trị hệ thống</h1>
          <p className="text-gray-600">Chào mừng admin! Bạn có thể quản lý các chức năng sau:</p>
        </div>

        {/* Admin Functions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/events" className="block bg-blue-100 hover:bg-blue-200 rounded-lg p-6 text-center shadow">
            <span className="text-xl font-semibold text-blue-800">Quản lý sự kiện</span>
            <div className="mt-2 text-sm text-gray-600">Duyệt, quản lý và xem danh sách sự kiện.</div>
          </Link>
          <Link href="/admin/users" className="block bg-green-100 hover:bg-green-200 rounded-lg p-6 text-center shadow">
            <span className="text-xl font-semibold text-green-800">Quản lý người dùng</span>
            <div className="mt-2 text-sm text-gray-600">Xem, phân quyền, chỉnh sửa thông tin người dùng.</div>
          </Link>
          <Link href="/admin/reports" className="block bg-yellow-100 hover:bg-yellow-200 rounded-lg p-6 text-center shadow">
            <span className="text-xl font-semibold text-yellow-800">Báo cáo & Thống kê</span>
            <div className="mt-2 text-sm text-gray-600">Xem báo cáo, thống kê hoạt động hệ thống.</div>
          </Link>
        </div>

        {/* Organizer Workflow Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-700">Quy trình dành cho Ban tổ chức</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1: Create Event */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</div>
                <h3 className="text-lg font-semibold text-blue-800">Tạo sự kiện</h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">Ban tổ chức đăng nhập và điền thông tin để tạo sự kiện mới.</p>
              <Link href="/admin/events/create" className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Tạo sự kiện
              </Link>
            </div>

            {/* Step 2: Share Event */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</div>
                <h3 className="text-lg font-semibold text-green-800">Chia sẻ sự kiện</h3>
              </div>
              <p className="text-sm text-green-700 mb-4">Sau khi được duyệt, chia sẻ đường dẫn hoặc QR code đến người tham gia.</p>
              <Link href="/admin/events" className="inline-block bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                Xem sự kiện
              </Link>
            </div>

            {/* Step 3: Check-in Management */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</div>
                <h3 className="text-lg font-semibold text-purple-800">Quản lý check-in</h3>
              </div>
              <p className="text-sm text-purple-700 mb-4">Tại sự kiện, quét QR code để check-in từng người tham gia.</p>
              <Link href="/admin/events/checkin" className="inline-block bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
                Quét QR Code
              </Link>
            </div>

            {/* Step 4: View Reports */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</div>
                <h3 className="text-lg font-semibold text-orange-800">Xem báo cáo</h3>
              </div>
              <p className="text-sm text-orange-700 mb-4">Xem báo cáo tổng hợp về số lượng đăng ký và tham gia.</p>
              <Link href="/admin/reports" className="inline-block bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700">
                Xem báo cáo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
