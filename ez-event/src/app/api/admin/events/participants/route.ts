import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/app/api/_utils/auth';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'Thiếu eventId.' }, { status: 400 });
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId: Number(eventId), checkedIn: true },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ participants: registrations });
}




