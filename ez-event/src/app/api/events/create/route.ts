import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EventStatus } from '@prisma/client';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { name, description, startTime, endTime, location, imageUrl, organizerId } = await request.json();
  if (!name || !startTime || !endTime) {
    return NextResponse.json({ error: 'Thiếu tên, thời gian bắt đầu hoặc kết thúc.' }, { status: 400 });
  }

  // Generate unique QR code and share URL
  const qrCode = crypto.randomBytes(16).toString('hex');
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/event/${qrCode}`;

  const event = await prisma.event.create({
    data: {
      name,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      imageUrl,
      organizerId: organizerId || null,
      qrCode,
      shareUrl,
      status: EventStatus.PENDING, // New events need approval
    },
  });

  return NextResponse.json({ message: 'Tạo sự kiện thành công! Đang chờ duyệt.', event });
}
