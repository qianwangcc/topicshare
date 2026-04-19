import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { topicId, text, imageUrl } = await req.json();
  if (!topicId) return NextResponse.json({ error: 'topicId required' }, { status: 400 });
  if (!text?.trim() && !imageUrl) {
    return NextResponse.json({ error: 'Post must have text or an image' }, { status: 400 });
  }

  const membership = await prisma.topicMember.findUnique({
    where: { topicId_userId: { topicId, userId: session.userId } },
  });
  if (!membership) return NextResponse.json({ error: 'Not a member of this topic' }, { status: 403 });

  const post = await prisma.post.create({
    data: {
      topicId,
      authorId: session.userId,
      text: text?.trim() || null,
      imageUrl: imageUrl || null,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await req.json();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.authorId !== session.userId)
    return NextResponse.json({ error: 'Only the author can delete this post' }, { status: 403 });

  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
