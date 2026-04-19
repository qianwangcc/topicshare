import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AiPanel from '@/components/AiPanel';

export default async function AiPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?redirectTo=/topics/${params.id}/ai`);

  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: {
      members: { select: { userId: true } },
      _count: { select: { posts: true } },
    },
  });

  if (!topic) notFound();

  const isMember = topic.members.some((m) => m.userId === session.userId);
  if (!isMember) redirect('/topics');

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/topics/${topic.id}`} className="text-gray-400 hover:text-gray-600">←</Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-500 truncate">{topic.title}</p>
        </div>
      </div>

      {topic._count.posts === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🤖</div>
          <p className="font-medium">No posts to analyse yet</p>
          <p className="text-sm mt-1">Add some posts to the topic first</p>
        </div>
      ) : (
        <AiPanel topicId={topic.id} postCount={topic._count.posts} />
      )}
    </div>
  );
}
