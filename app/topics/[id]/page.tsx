import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import PostCard from '@/components/PostCard';
import PostForm from '@/components/PostForm';
import InviteButton from '@/components/InviteButton';
import DeleteTopicButton from '@/components/DeleteTopicButton';
import SaveAccountBanner from '@/components/SaveAccountBanner';

export default async function TopicPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?redirectTo=/topics/${params.id}`);

  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      posts: {
        include: {
          author: { select: { id: true, name: true, email: true } },
          reactions: true,
          comments: {
            include: { author: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!topic) notFound();

  const isMember = topic.members.some((m) => m.userId === session.userId);
  if (!isMember) redirect(`/join/${topic.inviteCode}`);

  const isCreator = topic.creatorId === session.userId;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const inviteUrl = `${appUrl}/join/${topic.inviteCode}`;

  // Detect guest: guest emails follow the pattern guest-uuid@topicshare.local
  const isGuest = session.email.endsWith('@topicshare.local');

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/topics" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{topic.title}</h1>
        <Link
          href={`/topics/${topic.id}/ai`}
          className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-3 py-1 rounded-full font-medium hover:bg-brand-100 transition-colors"
        >
          ✨ AI
        </Link>
      </div>

      {topic.description && (
        <p className="text-sm text-gray-500 mb-3 ml-8">{topic.description}</p>
      )}

      <div className="flex items-center gap-3 mb-5 ml-8 flex-wrap">
        <span className="text-xs text-gray-400">{topic.members.length} member{topic.members.length !== 1 ? 's' : ''}</span>
        <InviteButton inviteUrl={inviteUrl} />
        {isCreator && <DeleteTopicButton topicId={topic.id} />}
      </div>

      {isGuest && <SaveAccountBanner />}
      <PostForm topicId={topic.id} />

      <div className="mt-6 space-y-4">
        {topic.posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          topic.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={session.userId}
              isTopicCreator={isCreator}
            />
          ))
        )}
      </div>
    </div>
  );
}
