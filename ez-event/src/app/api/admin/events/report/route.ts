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

  const totalRegistrations = await prisma.registration.count({ where: { eventId: Number(eventId) } });
  const totalCheckins = await prisma.registration.count({ where: { eventId: Number(eventId), checkedIn: true } });
  const attendanceRate = totalRegistrations > 0 ? (totalCheckins / totalRegistrations) * 100 : 0;

  return NextResponse.json({
    totalRegistrations,
    totalCheckins,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
  });
}





