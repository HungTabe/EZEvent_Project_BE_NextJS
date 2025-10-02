import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/app/api/_utils/auth';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const events = await prisma.event.findMany({
    orderBy: { startTime: 'desc' },
    include: {
      _count: { select: { registrations: true } },
    },
  });
  return NextResponse.json({ events });
}


