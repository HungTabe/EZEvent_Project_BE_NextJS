import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  const {
    email,
    name,
    password,
    role,
    phone,
    organization,
    jobTitle,
  } = await request.json();

  // Basic server-side validation
  const fieldErrors: Record<string, string> = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-()\s]{6,20}$/;

  if (!email || !emailPattern.test(email)) {
    fieldErrors.email = 'Email không hợp lệ';
  }
  if (!password || String(password).length < 6) {
    fieldErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
  }
  if (phone && !phonePattern.test(phone)) {
    fieldErrors.phone = 'Số điện thoại không hợp lệ';
  }
  if (name && String(name).length > 100) {
    fieldErrors.name = 'Tên quá dài (tối đa 100 ký tự)';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ', fieldErrors }, { status: 400 });
  }

  // Kiểm tra email đã tồn tại
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email đã tồn tại.', fieldErrors: { email: 'Email đã tồn tại' } }, { status: 409 });
  }

  // Chuẩn hóa role theo enum UserRole, mặc định USER nếu không hợp lệ/không truyền
  const normalizedRole: UserRole = (role && Object.prototype.hasOwnProperty.call(UserRole, role))
    ? (UserRole as any)[role]
    : UserRole.USER;

  // Lưu password và role (mặc định USER nếu không truyền)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password,
      role: normalizedRole,
      phone,
      organization,
      jobTitle,
    },
  });

  return NextResponse.json({ message: 'Đăng ký thành công', user });
}
