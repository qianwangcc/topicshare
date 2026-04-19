import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();

  if (!email || !password || !name?.trim()) {
    return NextResponse.json({ error: 'Email, name and password required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  let user;
  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    // Allow upgrading a magic-link-only account (no password set) to email+password
    if (existing.password) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { name: name.trim(), password: hashed },
    });
  } else {
    user = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), name: name.trim(), password: hashed },
    });
  }

  const token = await createSession({ userId: user.id, email: user.email });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieOptions(token));
  return response;
}
