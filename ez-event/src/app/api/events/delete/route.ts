import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Chỉ ORGANIZER và ADMIN mới được xóa sự kiện
    if (decoded.role !== 'ORGANIZER' && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền xóa sự kiện' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Thiếu id sự kiện.' }, { status: 400 });
    }

    // Nếu là ORGANIZER, chỉ được xóa sự kiện do mình tạo
    if (decoded.role === 'ORGANIZER') {
      const event = await prisma.event.findFirst({
        where: { id: Number(id), createdBy: decoded.userId }
      });
      
      if (!event) {
        return NextResponse.json({ error: 'Không tìm thấy sự kiện hoặc không có quyền xóa' }, { status: 404 });
      }
    }

    await prisma.event.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Đã xóa sự kiện!' });
  } catch (err) {
    return NextResponse.json({ error: 'Không thể xóa sự kiện hoặc sự kiện không tồn tại.' }, { status: 404 });
  }
}
