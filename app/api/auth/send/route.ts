import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendMagicLink } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, redirectTo } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.magicLink.create({ data: { email, token, expiresAt } });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const verifyUrl = new URL('/verify', appUrl);
    verifyUrl.searchParams.set('token', token);
    if (redirectTo) verifyUrl.searchParams.set('redirectTo', redirectTo);

    await sendMagicLink(email, verifyUrl.toString());

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/send]', err);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
