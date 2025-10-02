import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EventStatus } from '@prisma/client';

export async function GET() {
  const events = await prisma.event.findMany({
    where: { status: EventStatus.APPROVED },
    orderBy: { startTime: 'desc' },
  });
  return NextResponse.json({ events });
}
