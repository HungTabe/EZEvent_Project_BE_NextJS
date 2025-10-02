import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Thiếu id sự kiện.' }, { status: 400 });
  }
  const event = await prisma.event.findUnique({ where: { id: Number(id) } });
  if (!event) {
    return NextResponse.json({ error: 'Không tìm thấy sự kiện.' }, { status: 404 });
  }
  return NextResponse.json({ event });
}
