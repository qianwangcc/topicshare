import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing && existing.id !== session.userId) {
    return NextResponse.json({ error: 'Email already taken' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: session.userId },
    data: { email: email.toLowerCase().trim(), password: hashed },
  });

  return NextResponse.json({ ok: true });
}
