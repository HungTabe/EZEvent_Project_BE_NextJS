# EZEvent Project Notes

## Những công việc đã làm

- Khởi tạo dự án Next.js
- Cài đặt Prisma và cấu hình kết nối database PostgreSQL qua Accelerate/Data Proxy
- Thiết kế và cập nhật schema cho các bảng: User, Event, Registration, Notification, EventRole, Role
- Tạo migration và đồng bộ database với schema
- Reset lại database để đồng bộ migration

## Những công việc tiếp theo cần làm

1. Tạo các API cho chức năng:
   - Đăng ký tài khoản người dùng (Participant)
   - Đăng nhập/đăng xuất
   - Tạo sự kiện mới (Organizer)
   - Đăng ký tham gia sự kiện, sinh QR code
   - Check-in sự kiện bằng QR code
   - Gửi và nhận thông báo
   - Quản lý danh sách người tham gia, phân quyền quản lý sự kiện
   - Xem báo cáo sự kiện

2. Xây dựng giao diện người dùng:
   - Trang đăng ký, đăng nhập
   - Trang khám phá/tìm kiếm sự kiện
   - Trang chi tiết sự kiện, đăng ký tham gia
   - Trang check-in, quét QR
   - Trang quản lý sự kiện cho Organizer
   - Trang báo cáo, thống kê

3. Tích hợp AI gợi ý sự kiện (nếu cần)

4. Viết tài liệu hướng dẫn sử dụng và phát triển

---
Cập nhật thêm các đầu việc mới khi phát sinh trong quá trình phát triển.