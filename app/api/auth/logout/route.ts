import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const opts = clearSessionCookie();
  response.cookies.set(opts);
  return response;
}
