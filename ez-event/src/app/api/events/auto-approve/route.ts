import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Cho phép admin chạy mà không cần token (để test)
      // return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
      
      // Chỉ ADMIN mới được chạy manual
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
      }
    }

    // Tự động approve tất cả sự kiện của ORGANIZER đang PENDING
    const pendingOrganizerEvents = await prisma.event.findMany({
      where: {
        status: 'PENDING',
        creator: {
          role: { in: ['ORGANIZER', 'ADMIN'] }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log(`Found ${pendingOrganizerEvents.length} PENDING events from ORGANIZERs/ADMINs`);

    const approvedEvents = [];

    for (const event of pendingOrganizerEvents) {
      const updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: { status: 'APPROVED' }
      });

      approvedEvents.push({
        id: updatedEvent.id,
        name: updatedEvent.name,
        creator: event.creator
      });
    }

    return NextResponse.json({ 
      message: `Đã tự động phê duyệt ${approvedEvents.length} sự kiện của ORGANIZER/ADMIN`,
      approvedEvents
    });
  } catch (error) {
    console.error('Error auto-approving events:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}