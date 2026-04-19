import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const redirectTo = req.nextUrl.searchParams.get('redirectTo') ?? '/topics';

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', req.url));
  }

  const magic = await prisma.magicLink.findUnique({ where: { token } });

  if (!magic || magic.used || magic.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  await prisma.magicLink.update({ where: { id: magic.id }, data: { used: true } });

  let user = await prisma.user.findUnique({ where: { email: magic.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: magic.email } });
  }

  const sessionToken = await createSession({ userId: user.id, email: user.email });
  const opts = sessionCookieOptions(sessionToken);

  const response = NextResponse.redirect(new URL(redirectTo, req.url));
  response.cookies.set(opts);
  return response;
}
