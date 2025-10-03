import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Tìm tất cả sự kiện chưa có qrCode hoặc shareUrl hoặc cần auto-approve
    const eventsToUpdate = await prisma.event.findMany({
      where: {
        OR: [
          { qrCode: null },
          { shareUrl: null },
          // Tự động approve các sự kiện của ORGANIZER đang PENDING
          { 
            status: 'PENDING',
            creator: {
              role: { in: ['ORGANIZER', 'ADMIN'] }
            }
          }
        ]
      },
      include: {
        creator: true
      }
    });

    console.log(`Found ${eventsToUpdate.length} events to update`);

    const updatedEvents = [];

    for (const event of eventsToUpdate) {
      const shareUrl = event.shareUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/student/events/${event.id}`;
      const qrCode = event.qrCode || `QR_${event.id}_${Date.now()}`;
      
      // Tự động approve nếu là ORGANIZER/ADMIN và đang PENDING
      const shouldAutoApprove = event.status === 'PENDING' && 
        event.creator && 
        (event.creator.role === 'ORGANIZER' || event.creator.role === 'ADMIN');

      const updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: {
          shareUrl,
          qrCode,
          ...(shouldAutoApprove && { status: 'APPROVED' })
        },
      });

      updatedEvents.push(updatedEvent);
    }

    return NextResponse.json({ 
      message: `Đã cập nhật ${updatedEvents.length} sự kiện`,
      updatedCount: updatedEvents.length
    });
  } catch (error) {
    console.error('Error batch updating QR codes:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}