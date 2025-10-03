import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    // Verify organizer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as { userId: number };

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ error: 'Thiếu eventId' }, { status: 400 });
    }

    // Kiểm tra xem sự kiện có thuộc về organizer này không
    const event = await prisma.event.findFirst({
      where: {
        id: parseInt(eventId),
        createdBy: decoded.userId
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện hoặc bạn không có quyền truy cập' }, { status: 404 });
    }

    // Lấy tất cả registrations của sự kiện
    const registrations = await prisma.registration.findMany({
      where: { 
        eventId: parseInt(eventId)
      },
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            name: true,
            phone: true,
            organization: true,
            jobTitle: true
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Phân chia participants (đã check-in) và registrations (tất cả đăng ký)
    const participants = registrations.filter(reg => reg.checkedIn);
    const allRegistrations = registrations;

    return NextResponse.json({ 
      participants,
      registrations: allRegistrations,
      total: allRegistrations.length,
      checkedIn: participants.length,
      pendingCheckIn: allRegistrations.length - participants.length
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return NextResponse.json({ 
      error: 'Lỗi khi lấy danh sách người tham gia' 
    }, { status: 500 });
  }
}