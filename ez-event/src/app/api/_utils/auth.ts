import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

export interface AuthUser {
  userId: number;
  email: string;
  role?: string;
}

type TokenPayload = JwtPayload & {
  userId: number;
  email: string;
  role?: 'ADMIN' | 'USER';
};

export function extractToken(request: Request): string | null {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    if (typeof decoded === 'string') return null;
    const payload = decoded as TokenPayload;
    return { userId: payload.userId, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function requireAdmin(request: Request): { ok: true; user: AuthUser } | { ok: false; response: NextResponse } {
  const token = extractToken(request);
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const user = verifyToken(token);
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
  if (user.role !== 'ADMIN') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true, user };
}



