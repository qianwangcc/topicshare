import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      posts: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isMember = topic.members.some((m) => m.userId === session.userId);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(topic);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const topic = await prisma.topic.findUnique({ where: { id: params.id } });
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (topic.creatorId !== session.userId)
    return NextResponse.json({ error: 'Only the creator can delete this topic' }, { status: 403 });

  await prisma.topic.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
