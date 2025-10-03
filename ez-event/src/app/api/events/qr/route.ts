import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qrCode = searchParams.get('qr');
    
    if (!qrCode) {
      return NextResponse.json({ error: 'Thiếu mã QR' }, { status: 400 });
    }

    // Tìm sự kiện theo QR code
    const event = await prisma.event.findUnique({
      where: { qrCode },
      select: {
        id: true,
        name: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        status: true,
        shareUrl: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện với mã QR này' }, { status: 404 });
    }

    if (event.status !== 'APPROVED') {
      return NextResponse.json({ 
        error: 'Sự kiện chưa được phê duyệt hoặc đã bị hủy',
        event 
      }, { status: 400 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error processing QR code:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Cần đăng nhập để đăng ký' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    
    // Chỉ STUDENT mới được đăng ký qua QR
    if (decoded.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Chỉ sinh viên mới có thể đăng ký sự kiện' }, { status: 403 });
    }

    const { qrCode } = await request.json();
    
    if (!qrCode) {
      return NextResponse.json({ error: 'Thiếu mã QR' }, { status: 400 });
    }

    // Tìm sự kiện theo QR code
    const event = await prisma.event.findUnique({
      where: { qrCode }
    });

    if (!event) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện với mã QR này' }, { status: 404 });
    }

    if (event.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Sự kiện chưa được phê duyệt' }, { status: 400 });
    }

    // Kiểm tra đã đăng ký chưa
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        userId: decoded.userId,
        eventId: event.id
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ 
        error: 'Bạn đã đăng ký sự kiện này rồi',
        registration: existingRegistration 
      }, { status: 400 });
    }

    // Tạo đăng ký mới
    const registration = await prisma.registration.create({
      data: {
        userId: decoded.userId,
        eventId: event.id,
        qrCode: `REG_${event.id}_${decoded.userId}_${Date.now()}`
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Đăng ký sự kiện thành công qua QR code!',
      registration 
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }
    console.error('Error registering via QR code:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}