import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession, sessionCookieOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const { inviteCode, name } = await req.json();

  if (!inviteCode) return NextResponse.json({ error: 'inviteCode required' }, { status: 400 });
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const topic = await prisma.topic.findUnique({ where: { inviteCode } });
  if (!topic) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });

  // Create a guest user with a placeholder email (not used for sending)
  const guestEmail = `guest-${uuidv4()}@topicshare.local`;
  const user = await prisma.user.create({
    data: { email: guestEmail, name: name.trim() },
  });

  // Join the topic
  await prisma.topicMember.create({
    data: { topicId: topic.id, userId: user.id },
  });

  // Create session
  const token = await createSession({ userId: user.id, email: user.email });
  const opts = sessionCookieOptions(token);

  const response = NextResponse.json({ topicId: topic.id });
  response.cookies.set(opts);
  return response;
}
