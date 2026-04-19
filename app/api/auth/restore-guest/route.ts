import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { guestId } = await req.json();
  if (!guestId) return NextResponse.json({ error: 'guestId required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: guestId } });
  if (!user) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });

  const token = await createSession({ userId: user.id, email: user.email });
  const opts = sessionCookieOptions(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(opts);
  return response;
}
