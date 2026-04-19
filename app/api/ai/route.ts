import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { summarisePosts, generateSocialPost } from '@/lib/qwen';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { topicId, action, platform } = await req.json();
  if (!topicId || !action) return NextResponse.json({ error: 'topicId and action required' }, { status: 400 });

  const membership = await prisma.topicMember.findUnique({
    where: { topicId_userId: { topicId, userId: session.userId } },
  });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      posts: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const input = {
    topicTitle: topic.title,
    posts: topic.posts.map((p) => ({
      author: p.author.name ?? p.author.email.split('@')[0],
      text: p.text,
      hasImage: !!p.imageUrl,
    })),
  };

  if (input.posts.length === 0) {
    return NextResponse.json({ error: 'No posts to summarise' }, { status: 400 });
  }

  let result: string;
  if (action === 'summarise') {
    result = await summarisePosts(input);
  } else if (action === 'generate_post') {
    result = await generateSocialPost(input, platform ?? 'xhs');
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  return NextResponse.json({ result });
}
