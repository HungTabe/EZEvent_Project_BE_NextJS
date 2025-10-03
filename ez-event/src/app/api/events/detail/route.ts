import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || searchParams.get('eventId');
  if (!id) {
    return NextResponse.json({ error: 'Thiếu id sự kiện.' }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({ 
      where: { id: Number(id) },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện.' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching event detail:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
