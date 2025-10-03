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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    
    // Chỉ ORGANIZER và ADMIN mới được tạo sự kiện
    if (decoded.role !== 'ORGANIZER' && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền tạo sự kiện' }, { status: 403 });
    }

    const { name, description, startTime, endTime, location, imageUrl } = await request.json();
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
        imageUrl,
        createdBy: decoded.userId,
        // ORGANIZER và ADMIN tự động được approved, không cần chờ phê duyệt
        status: decoded.role === 'ORGANIZER' || decoded.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      },
    });

    // Tạo share URL và QR code sau khi có event ID
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/student/events/${event.id}`;
    const qrCode = `QR_${event.id}_${Date.now()}`;

    // Cập nhật event với shareUrl và qrCode
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        shareUrl,
        qrCode,
      },
    });

    return NextResponse.json({ message: 'Tạo sự kiện thành công!', event: updatedEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Token không hợp lệ hoặc lỗi server' }, { status: 401 });
  }
}
