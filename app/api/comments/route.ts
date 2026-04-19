import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId, text } = await req.json();
  if (!postId || !text?.trim()) {
    return NextResponse.json({ error: 'postId and text required' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { postId, authorId: session.userId, text: text.trim() },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { commentId } = await req.json();
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (comment.authorId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
