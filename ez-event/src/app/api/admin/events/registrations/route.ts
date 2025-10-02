import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/app/api/_utils/auth';

// GET /api/admin/events/registrations?eventId=123
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? Number(eventIdParam) : NaN;
  if (!eventId || Number.isNaN(eventId)) {
    return NextResponse.json({ error: 'Thiếu hoặc sai eventId' }, { status: 400 });
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, name: true } }
    }
  });

  return NextResponse.json({ registrations });
}


