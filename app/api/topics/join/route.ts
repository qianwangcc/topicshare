import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: 'inviteCode required' }, { status: 400 });

  const topic = await prisma.topic.findUnique({ where: { inviteCode } });
  if (!topic) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

  await prisma.topicMember.upsert({
    where: { topicId_userId: { topicId: topic.id, userId: session.userId } },
    create: { topicId: topic.id, userId: session.userId },
    update: {},
  });

  return NextResponse.json({ topicId: topic.id });
}
