import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'Thiếu eventId.' }, { status: 400 });
  }

  const roles = await prisma.eventRole.findMany({
    where: { eventId: Number(eventId) },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  return NextResponse.json({ roles });
}

export async function POST(request: Request) {
  const { eventId, userId, role } = await request.json();
  if (!eventId || !userId || !role) {
    return NextResponse.json({ error: 'Thiếu thông tin.' }, { status: 400 });
  }

  const normalizedRole: Role | null = (role && Object.prototype.hasOwnProperty.call(Role, role)) ? (Role as any)[role] : null;
  if (!normalizedRole) {
    return NextResponse.json({ error: 'Role không hợp lệ.' }, { status: 400 });
  }

  const eventRole = await prisma.eventRole.create({
    data: {
      eventId,
      userId,
      role: normalizedRole,
    },
  });

  return NextResponse.json({ message: 'Phân quyền thành công', eventRole });
}
