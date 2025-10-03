import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Chỉ ORGANIZER và ADMIN mới được tạo sự kiện
    if (decoded.role !== 'ORGANIZER' && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền tạo sự kiện' }, { status: 403 });
    }

    const { name, description, startTime, endTime, location } = await request.json();
    if (!name || !startTime || !endTime) {
      return NextResponse.json({ error: 'Thiếu tên, thời gian bắt đầu hoặc kết thúc.' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        createdBy: decoded.userId,
      },
    });

    return NextResponse.json({ message: 'Tạo sự kiện thành công!', event });
  } catch (err) {
    return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
  }
}
