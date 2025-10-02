import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, role: true }
  });
  if (!user) {
    return NextResponse.json({ error: 'Tài khoản không tồn tại.' }, { status: 401 });
  }

  // Kiểm tra mật khẩu (ở đây so sánh plain, nên dùng hash thực tế)
  if (user.password !== password) {
    return NextResponse.json({ error: 'Mật khẩu không đúng.' }, { status: 401 });
  }

  // Tạo JWT, thêm role vào payload
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return NextResponse.json({ message: 'Đăng nhập thành công', token, user });
}
