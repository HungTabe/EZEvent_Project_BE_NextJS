import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const events = await prisma.event.findMany({
      where: { createdBy: decoded.userId },
      orderBy: { startTime: 'desc' },
    });
    
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
  }
}