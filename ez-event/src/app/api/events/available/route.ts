import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Lấy tất cả sự kiện đang hoạt động
    const events = await prisma.event.findMany({
      where: {
        // Chỉ lấy sự kiện chưa kết thúc
        endTime: {
          gte: new Date()
        }
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        registrations: userId ? {
          where: {
            userId: parseInt(userId)
          }
        } : false,
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Format dữ liệu trả về
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      creator: event.creator,
      participantCount: event._count.registrations,
      isRegistered: userId ? (event.registrations && event.registrations.length > 0) : false,
      registrationId: userId && event.registrations && event.registrations.length > 0 
        ? event.registrations[0].id 
        : null
    }));

    return NextResponse.json({ 
      events: formattedEvents,
      total: formattedEvents.length 
    });
  } catch (error) {
    console.error('Error fetching available events:', error);
    return NextResponse.json({ 
      error: 'Lỗi khi lấy danh sách sự kiện' 
    }, { status: 500 });
  }
}