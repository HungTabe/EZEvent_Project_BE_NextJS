import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { userId, eventId } = await request.json();
  if (!userId || !eventId) {
    return NextResponse.json({ error: 'Thiếu userId hoặc eventId.' }, { status: 400 });
  }

  // Kiểm tra đã đăng ký chưa
  const existing = await prisma.registration.findFirst({ where: { userId, eventId } });
  if (existing) {
    return NextResponse.json({ error: 'Đã đăng ký sự kiện này.' }, { status: 409 });
  }

  // Tạo mã QR duy nhất và bảo mật
  const qrCodeData = crypto.randomBytes(16).toString('hex');
  
  // Tạo QR code image
  const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      qrCode: qrCodeData,
      checkedIn: false,
    },
  });

  return NextResponse.json({ 
    message: 'Đăng ký sự kiện thành công', 
    registration,
    qrCodeImage,
    qrCodeData 
  });
}
