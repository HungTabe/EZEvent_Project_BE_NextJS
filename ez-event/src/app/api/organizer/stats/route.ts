import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    
    // Lấy thống kê sự kiện của organizer
    const currentTime = new Date();
    
    // Tổng số sự kiện
    const totalEvents = await prisma.event.count({
      where: { createdBy: decoded.userId }
    });

    // Sự kiện đang hoạt động (chưa kết thúc)
    const activeEvents = await prisma.event.count({
      where: {
        createdBy: decoded.userId,
        endTime: { gte: currentTime }
      }
    });

    // Sự kiện sắp diễn ra (trong 7 ngày tới)
    const upcomingEvents = await prisma.event.count({
      where: {
        createdBy: decoded.userId,
        startTime: {
          gte: currentTime,
          lte: new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Tổng số người tham gia
    const totalParticipants = await prisma.registration.count({
      where: {
        event: { createdBy: decoded.userId }
      }
    });

    // Số người đã check-in
    const checkedInParticipants = await prisma.registration.count({
      where: {
        event: { createdBy: decoded.userId },
        checkedIn: true
      }
    });

    // Sự kiện phổ biến nhất (có nhiều đăng ký nhất)
    const popularEvent = await prisma.event.findFirst({
      where: { createdBy: decoded.userId },
      include: {
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: {
        registrations: { _count: 'desc' }
      }
    });

    // Sự kiện gần đây nhất
    const recentEvents = await prisma.event.findMany({
      where: { createdBy: decoded.userId },
      include: {
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { startTime: 'desc' },
      take: 5
    });

    return NextResponse.json({
      stats: {
        totalEvents,
        activeEvents,
        upcomingEvents,
        totalParticipants,
        checkedInParticipants,
        completedEvents: totalEvents - activeEvents
      },
      popularEvent: popularEvent ? {
        id: popularEvent.id,
        name: popularEvent.name,
        participantCount: popularEvent._count.registrations
      } : null,
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        participantCount: event._count.registrations
      }))
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    return NextResponse.json({ 
      error: 'Lỗi khi lấy thống kê' 
    }, { status: 500 });
  }
}