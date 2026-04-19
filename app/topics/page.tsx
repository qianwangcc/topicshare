import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import TopicCard from '@/components/TopicCard';

export default async function TopicsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const topics = await prisma.topic.findMany({
    where: { members: { some: { userId: session.userId } } },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true, posts: true } },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const topicsWithActivity = topics.map((t) => ({
    ...t,
    lastPostAt: t.posts[0]?.createdAt ?? null,
  }));

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Topics</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="text-gray-400 hover:text-brand-600 transition-colors text-xl"
            title="Profile"
          >
            👤
          </Link>
          <Link
            href="/topics/new"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New
          </Link>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">💬</div>
          <p className="font-medium">No topics yet</p>
          <p className="text-sm mt-1">Create a topic and invite your friends</p>
          <Link
            href="/topics/new"
            className="inline-block mt-4 text-brand-600 font-semibold text-sm"
          >
            Create your first topic →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {topicsWithActivity.map((topic) => (
            <TopicCard key={topic.id} topic={topic} currentUserId={session.userId} />
          ))}
        </div>
      )}
    </div>
  );
}
