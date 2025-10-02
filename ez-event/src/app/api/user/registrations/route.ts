import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Thiếu userId.' }, { status: 400 });
  }

  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: Number(userId) },
      include: { 
        event: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể lấy danh sách đăng ký.' }, { status: 500 });
  }
}






