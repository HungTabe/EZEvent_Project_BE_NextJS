import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
    }

    // Lấy tất cả registrations của user
    const registrations = await prisma.registration.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            startTime: true,
            endTime: true,
            location: true,
            createdBy: true,
            creator: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format dữ liệu trả về
    const formattedRegistrations = registrations.map(reg => ({
      id: reg.id,
      eventId: reg.eventId,
      qrCode: reg.qrCode,
      checkedIn: reg.checkedIn,
      createdAt: reg.createdAt,
      event: {
        id: reg.event.id,
        name: reg.event.name,
        description: reg.event.description,
        startTime: reg.event.startTime,
        endTime: reg.event.endTime,
        location: reg.event.location,
        creator: reg.event.creator,
        status: "APPROVED" // Default status
      }
    }));

    return NextResponse.json({ 
      registrations: formattedRegistrations,
      total: formattedRegistrations.length 
    });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return NextResponse.json({ 
      error: 'Lỗi khi lấy danh sách đăng ký',
      registrations: [] 
    }, { status: 500 });
  }
}
