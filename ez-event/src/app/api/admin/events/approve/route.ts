import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/app/api/_utils/auth';
import { EventStatus } from '@prisma/client';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { eventId, status } = await request.json();
  if (!eventId || !status) {
    return NextResponse.json({ error: 'Thiếu eventId hoặc status.' }, { status: 400 });
  }
  if (!(status in EventStatus) || ![EventStatus.APPROVED, EventStatus.REJECTED].includes(status as EventStatus)) {
    return NextResponse.json({ error: 'Status không hợp lệ.' }, { status: 400 });
  }

  try {
    const event = await prisma.event.update({ where: { id: Number(eventId) }, data: { status: status as EventStatus } });
    return NextResponse.json({ message: 'Cập nhật trạng thái thành công', event });
  } catch (_err) {
    return NextResponse.json({ error: 'Không thể cập nhật sự kiện.' }, { status: 404 });
  }
}




