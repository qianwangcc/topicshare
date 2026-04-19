import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const topics = await prisma.topic.findMany({
    where: {
      members: { some: { userId: session.userId } },
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true, posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, coverImage } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const topic = await prisma.topic.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      coverImage: coverImage || null,
      creatorId: session.userId,
      members: { create: { userId: session.userId } },
    },
  });

  return NextResponse.json(topic, { status: 201 });
}
