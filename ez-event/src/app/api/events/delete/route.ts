import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Thiếu id sự kiện.' }, { status: 400 });
  }
  try {
    await prisma.event.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Đã xóa sự kiện!' });
  } catch (err) {
    return NextResponse.json({ error: 'Không thể xóa sự kiện hoặc sự kiện không tồn tại.' }, { status: 404 });
  }
}
