import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const ALLOWED_EMOJIS = ['❤️', '😂', '🔥', '👍', '😮'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId, emoji } = await req.json();
  if (!postId || !emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId_emoji: { postId, userId: session.userId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: 'removed' });
  }

  await prisma.reaction.create({ data: { postId, userId: session.userId, emoji } });
  return NextResponse.json({ action: 'added' });
}
