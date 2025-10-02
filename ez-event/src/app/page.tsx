import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100">
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-blue-700 focus:ring-2 focus:ring-blue-600 rounded px-3 py-2 shadow"
      >
        Bỏ qua đến nội dung chính
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Trang chủ EZEvent">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:rotate-3">
                <span className="text-white font-bold text-sm">EZ</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">EZEvent</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6" aria-label="Điều hướng chính">
              <Link href="/events" className="text-gray-700 hover:text-blue-700 transition-colors">
                Sự kiện
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors shadow-sm"
              >
                <span>Đăng nhập</span>
              </Link>
            </nav>
            <div className="md:hidden">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors shadow-sm"
              >
                <span>Đăng nhập</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main" className="relative">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-20 -z-10 overflow-hidden">
          <div className="mx-auto max-w-7xl blur-3xl opacity-30">
            <div className="h-64 sm:h-80 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-full" />
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 lg:pt-24 pb-10 sm:pb-16">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 sm:mb-6">
              Quản lý sự kiện<span className="text-blue-700"> dễ dàng</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Tạo sự kiện, quản lý đăng ký, check-in bằng QR code và theo dõi báo cáo
              một cách đơn giản, trực quan và hiệu quả.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/events"
                className="inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-base sm:text-lg font-medium transition-colors shadow-sm"
              >
                Khám phá sự kiện
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex justify-center items-center gap-2 border-2 border-blue-600 text-blue-700 px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-base sm:text-lg font-medium transition-colors"
              >
                Tạo sự kiện
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16">
            <article className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tạo sự kiện</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Dễ dàng tạo và quản lý sự kiện với đầy đủ thông tin.</p>
            </article>

            <article className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Check-in</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Quét QR code để check-in nhanh chóng và chính xác.</p>
            </article>

            <article className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Báo cáo</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Theo dõi số liệu đăng ký và tham gia chi tiết.</p>
            </article>

            <article className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông báo</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Gửi thông báo đến người tham gia một cách tiện lợi.</p>
            </article>
          </div>

          {/* How it works */}
          <section className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">Cách thức hoạt động</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-blue-700 font-semibold text-xl sm:text-2xl rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Ban tổ chức</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Tạo sự kiện và chia sẻ QR code để mời người tham gia.</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-700 font-semibold text-xl sm:text-2xl rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Người tham gia</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Đăng ký sự kiện và nhận QR code cá nhân.</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 text-purple-700 font-semibold text-xl sm:text-2xl rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Check-in</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Quét QR code tại sự kiện để check-in và theo dõi báo cáo.</p>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 sm:py-12 mt-10 sm:mt-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">EZ</span>
            </div>
            <span className="font-semibold tracking-tight">EZEvent</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 EZEvent. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
