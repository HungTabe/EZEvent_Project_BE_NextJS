import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/app/api/_utils/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { qrCode, eventId } = await request.json();
  if (!qrCode) {
    return NextResponse.json({ error: 'Thiếu mã QR.' }, { status: 400 });
  }

  const registration = await prisma.registration.findFirst({ where: { qrCode } });
  if (!registration) {
    return NextResponse.json({ error: 'Không tìm thấy đăng ký.' }, { status: 404 });
  }
  if (eventId && Number(eventId) !== registration.eventId) {
    return NextResponse.json({ error: 'QR không thuộc sự kiện này.' }, { status: 409 });
  }
  if (registration.checkedIn) {
    return NextResponse.json({ error: 'Đã check-in trước đó.' }, { status: 409 });
  }

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: { checkedIn: true },
  });

  return NextResponse.json({ message: 'Check-in thành công', registration: updated });
}




